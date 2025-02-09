import { SQL, and, eq, sql } from 'drizzle-orm'

import { db } from '../db/index.server'
import {
  asset as assetTable,
  assetSchema,
  assetType,
} from '../db/schema/asset.server'
import type { Asset, AssetType } from '../db/schema/asset.server'

import MarketService from '../maketService/index.server'

export { assetType }
export type { AssetType }

type PersistanceAsset = Asset

export type DomainAsset = Omit<PersistanceAsset, 'owner'>
export type NewAsset = Omit<DomainAsset, 'id' | 'walletId'>
export type UpdateAsset = Partial<
  Omit<PersistanceAsset, 'owner' | 'walletId' | 'type'>
>

export type AssetWithPrice = DomainAsset & {
  price: number
  totalValue: number
  percentage: number
}

function toDomain(asset: PersistanceAsset): DomainAsset {
  return {
    id: asset.id,
    type: asset.type,
    name: asset.name,
    amount: asset.amount,
    walletId: asset.walletId,
    price: asset.price,
  }
}

class AssetService {
  async getAssetsByWallet(
    uid: string,
    walletId: string,
  ): Promise<DomainAsset[]> {
    const assets = await db
      .select()
      .from(assetTable)
      .where(and(eq(assetTable.owner, uid), eq(assetTable.walletId, walletId)))

    return assets.map(toDomain)
  }

  async getAssetsByWalletWithPrices(
    uid: string,
    walletId: string,
    walletType: AssetType,
  ): Promise<[AssetWithPrice[], DomainAsset[]]> {
    const assets = await this.getAssetsByWallet(uid, walletId)

    let priceGetter: (asset: DomainAsset) => Promise<number>

    if (walletType === 'br-stock') {
      priceGetter = async ({ name }) => {
        const { regularMarketPrice } = await MarketService.getStockData(name)
        return regularMarketPrice
      }
    } else if (walletType === 'fixed-value') {
      priceGetter = async ({ price }) => {
        if (price == null)
          throw new Error(
            "Fixed value wallet's assets should have a price when created",
          )

        return price
      }
    } else {
      throw new Error(`Wallet type ${walletType} is not supported yet.`)
    }

    const mapped = await Promise.all(
      assets.map(async (a) => {
        try {
          const price = await priceGetter(a)
          return {
            ...a,
            price,
            totalValue: a.amount * price,
          }
        } catch (e) {
          return a
        }
      }),
    )

    let assetssWithPrices: Omit<AssetWithPrice, 'percentage'>[] = []
    let assetsWithoutPrices: DomainAsset[] = []
    for (const asset of mapped) {
      if (asset.price != null) {
        assetssWithPrices.push(asset as AssetWithPrice)
      } else {
        assetsWithoutPrices.push(asset)
      }
    }

    const totalValue = assetssWithPrices.reduce((a, s) => a + s.totalValue, 0)

    const assetsWithPricesAndPercentages: AssetWithPrice[] =
      assetssWithPrices.map((s) => ({
        ...s,
        percentage: s.totalValue / totalValue,
      }))

    return [assetsWithPricesAndPercentages, assetsWithoutPrices]
  }

  async createAsset(
    uid: string,
    walletId: string,
    newAsset: NewAsset,
  ): Promise<DomainAsset> {
    const walletAssets = await this.getAssetsByWallet(uid, walletId)

    const sameName = walletAssets.find((a) => a.name === newAsset.name)

    if (sameName) {
      throw new Error('Name already in use for this wallet')
    }

    const [created] = await db
      .insert(assetTable)
      .values({
        owner: uid,
        walletId,
        type: newAsset.type,
        name: newAsset.name,
        amount: newAsset.amount,
        price: newAsset.price,
      })
      .returning()

    return toDomain(created)
  }

  async update(
    uid: string,
    walletId: string,
    assetId: string,
    updateAsset: UpdateAsset,
  ): Promise<DomainAsset> {
    const [updated] = await db
      .update(assetTable)
      .set({ amount: updateAsset.amount, price: updateAsset.price })
      .where(
        and(
          eq(assetTable.owner, uid),
          eq(assetTable.walletId, walletId),
          eq(assetTable.id, assetId),
        ),
      )
      .returning()

    return updated
  }

  async updateAmount(
    uid: string,
    walletId: string,
    assetId: string,
    amount: number,
  ): Promise<DomainAsset> {
    const [updated] = await db
      .update(assetTable)
      .set({
        amount,
      })
      .where(
        and(
          eq(assetTable.owner, uid),
          eq(assetTable.walletId, walletId),
          eq(assetTable.id, assetId),
        ),
      )
      .returning()

    return toDomain(updated)
  }

  async updateMany(
    uid: string,
    walletId: string,
    assets: UpdateAsset[],
  ): Promise<DomainAsset[]> {
    const sqlChunks: SQL[] = []
    const idsChunks: SQL[] = []

    assets.forEach((s) => {
      idsChunks.push(sql`${s.id}`)
    })

    const finalIds = sql.join(idsChunks, sql.raw(','))

    sqlChunks.push(sql`update ${assetTable} set "amount"`) // this might be bad, but it does not accpet ${asset.amount}

    sqlChunks.push(sql`= case`)

    assets.forEach((s) => {
      sqlChunks.push(
        sql`when "id" = ${s.id} and "owner" = ${uid} then ${s.amount}`,
      )
    })

    sqlChunks.push(sql`else "amount"`)
    sqlChunks.push(sql`end`)

    sqlChunks.push(sql`where "id" in (${finalIds})`)

    sqlChunks.push(
      sql`returning id, name, asset_type as "type", amount, wallet_id as "walletId", owner, price`,
    ) // this is where I miss the ORM

    const finalSql = sql.join(sqlChunks, sql.raw(' '))

    const res = await db.execute(finalSql)

    return res.map((s) => toDomain(assetSchema.parse(s)))
  }

  async deleteAsset(
    uid: string,
    walletId: string,
    assetId: string,
  ): Promise<void> {
    await db
      .delete(assetTable)
      .where(
        and(
          eq(assetTable.owner, uid),
          eq(assetTable.walletId, walletId),
          eq(assetTable.id, assetId),
        ),
      )
  }

  // removes all the assets from the table
  async deleteAssetsFromWallet(uid: string, walletId: string): Promise<void> {
    await db
      .delete(assetTable)
      .where(and(eq(assetTable.owner, uid), eq(assetTable.walletId, walletId)))
  }
}

export default new AssetService()

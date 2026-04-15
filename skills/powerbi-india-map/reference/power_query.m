// Power Query — normalise LGD columns to zero-padded Text
let
    Source = Sql.Database("server", "db"),
    Grants = Source{[Schema="dbo",Item="fact_grants"]}[Data],
    Typed = Table.TransformColumnTypes(Grants, {
        {"state_lgd", type text},
        {"district_lgd", type text},
        {"block_shape_id", type text},
        {"sanctioned_amount", type number},
        {"disbursed_amount", type number},
        {"date_sanctioned", type date}
    }),
    PadState = Table.TransformColumns(Typed, {
        {"state_lgd", each Text.PadStart(_ ?? "", 2, "0"), type text}
    }),
    PadDistrict = Table.TransformColumns(PadState, {
        {"district_lgd", each if _ = null then null else Text.PadStart(_, 4, "0"), type text}
    })
in
    PadDistrict

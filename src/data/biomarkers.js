export const biomarkers = [
  { id: 'hemoglobina', name: 'Hemoglobina', unit: 'g/dL', category: 'Hemograma', direction: 'range', description: 'Proteína dos glóbulos vermelhos responsável pelo transporte de oxigénio.' },
  { id: 'eritrocitos', name: 'Eritrócitos', unit: '10^6/uL', category: 'Hemograma', direction: 'range', description: 'Contagem de glóbulos vermelhos.' },
  { id: 'hematocrito', name: 'Hematócrito', unit: '%', category: 'Hemograma', direction: 'range', description: 'Percentagem do volume do sangue ocupada por glóbulos vermelhos.' },
  { id: 'vgm', name: 'V.G.M.', unit: 'fL', category: 'Hemograma', direction: 'range', description: 'Volume globular médio dos eritrócitos.' },
  { id: 'hgm', name: 'H.G.M.', unit: 'pg', category: 'Hemograma', direction: 'range', description: 'Hemoglobina globular média.' },
  { id: 'cmhg', name: 'C.M.H.G.', unit: 'g/dL', category: 'Hemograma', direction: 'range', description: 'Concentração média de hemoglobina globular.' },
  { id: 'rdw', name: 'R.D.W', unit: '%', category: 'Hemograma', direction: 'range', description: 'Variação do tamanho dos eritrócitos.' },
  { id: 'leucocitos', name: 'Leucócitos', unit: '10^3/uL', category: 'Hemograma', direction: 'range', description: 'Contagem total de glóbulos brancos.' },
  { id: 'neutrofilos', name: 'Neutrófilos', unit: '%', category: 'Hemograma', direction: 'range', description: 'Percentagem de neutrófilos nos glóbulos brancos.' },
  { id: 'eosinofilos', name: 'Eosinófilos', unit: '%', category: 'Hemograma', direction: 'range', description: 'Percentagem de eosinófilos nos glóbulos brancos.' },
  { id: 'basofilos', name: 'Basófilos', unit: '%', category: 'Hemograma', direction: 'range', description: 'Percentagem de basófilos nos glóbulos brancos.' },
  { id: 'linfocitos', name: 'Linfócitos', unit: '%', category: 'Hemograma', direction: 'range', description: 'Percentagem de linfócitos nos glóbulos brancos.' },
  { id: 'monocitos', name: 'Monócitos', unit: '%', category: 'Hemograma', direction: 'range', description: 'Percentagem de monócitos nos glóbulos brancos.' },
  { id: 'plaquetas', name: 'Plaquetas', unit: '10^3/uL', category: 'Hemograma', direction: 'range', description: 'Contagem de plaquetas, relevantes para coagulação.' },

  { id: 'ferro_serico', name: 'Ferro Sérico', unit: 'ug/dL', category: 'Ferro e Anemia', direction: 'range', description: 'Ferro circulante no sangue.' },
  { id: 'ferritina', name: 'Ferritina', unit: 'ng/mL', category: 'Ferro e Anemia', direction: 'range', description: 'Marcador de reservas de ferro.' },
  { id: 'capacidade_fixacao_ferro', name: 'Capacidade Fixação do Ferro', unit: 'ug/dL', category: 'Ferro e Anemia', direction: 'range', description: 'Capacidade total de ligação/transporte de ferro.' },
  { id: 'sideremia', name: 'Siderémia', unit: 'ug/dL', category: 'Ferro e Anemia', direction: 'range', description: 'Concentração de ferro no soro.' },

  { id: 'proteina_c_reactiva', name: 'Proteína C Reactiva', unit: 'mg/L', category: 'Inflamação', direction: 'lower', description: 'Marcador de inflamação sistémica.' },

  { id: 'ureia_pre_dialise', name: 'Ureia (pré diálise)', unit: 'mg/dL', category: 'Rim e Diálise', direction: 'lower', description: 'Ureia antes da sessão de diálise.' },
  { id: 'ureia_pos_dialise', name: 'Ureia (pós diálise)', unit: 'mg/dL', category: 'Rim e Diálise', direction: 'lower', description: 'Ureia depois da sessão de diálise.' },
  { id: 'creatininemia', name: 'Creatininémia', unit: 'mg/dL', category: 'Rim e Diálise', direction: 'range', description: 'Creatinina sérica, influenciada por função renal e massa muscular.' },
  { id: 'acido_urico', name: 'Ácido Úrico', unit: 'mg/dL', category: 'Rim e Diálise', direction: 'lower', description: 'Produto do metabolismo das purinas.' },

  { id: 'albumina', name: 'Albumina', unit: 'g/dL', category: 'Nutrição', direction: 'higher', description: 'Proteína plasmática associada ao estado nutricional e inflamatório.' },
  { id: 'proteinas_totais', name: 'Proteínas Totais', unit: 'g/dL', category: 'Nutrição', direction: 'range', description: 'Soma das principais proteínas circulantes no sangue.' },

  { id: 'alanina_aminotransferase', name: 'Alanina aminotransferase', unit: 'U/L', category: 'Fígado', direction: 'lower', description: 'Enzima hepática frequentemente abreviada ALT.' },
  { id: 'fosfatase_alcalina', name: 'Fosfatase alcalina', unit: 'U/L', category: 'Fígado', direction: 'range', description: 'Enzima associada a fígado, vias biliares e osso.' },

  { id: 'sodio', name: 'Sódio', unit: 'mmol/L', category: 'Eletrólitos e Minerais', direction: 'range', description: 'Eletrólito essencial para equilíbrio hídrico e função neuromuscular.' },
  { id: 'magnesio', name: 'Magnésio', unit: 'mg/dL', category: 'Eletrólitos e Minerais', direction: 'range', description: 'Mineral envolvido em função muscular, nervosa e metabólica.' },
  { id: 'potassio', name: 'Potássio', unit: 'mmol/L', category: 'Eletrólitos e Minerais', direction: 'range', description: 'Eletrólito crítico, especialmente relevante em diálise.' },
  { id: 'calcio_total', name: 'Cálcio Total', unit: 'mg/dL', category: 'Eletrólitos e Minerais', direction: 'range', description: 'Cálcio total no sangue.' },
  { id: 'fosforo_inorganico', name: 'Fósforo Inorgânico', unit: 'mg/dL', category: 'Eletrólitos e Minerais', direction: 'lower', description: 'Fósforo no sangue, relevante em doença renal e diálise.' },

  { id: 'paratormona_pth', name: 'Paratormona PTH', unit: 'pg/mL', category: 'Osso e PTH', direction: 'range', description: 'Hormona paratiroideia, relevante no metabolismo cálcio-fósforo.' },

  { id: 'colesterol_total', name: 'Colesterol Total', unit: 'mg/dL', category: 'Lípidos', direction: 'lower', description: 'Colesterol total no sangue.' },
  { id: 'colesterol_ldl', name: 'Colesterol LDL', unit: 'mg/dL', category: 'Lípidos', direction: 'lower', description: 'Colesterol LDL, geralmente associado a risco cardiovascular quando elevado.' },
  { id: 'colesterol_hdl', name: 'Colesterol HDL', unit: 'mg/dL', category: 'Lípidos', direction: 'higher', description: 'Colesterol HDL, geralmente considerado protetor quando adequado.' },
  { id: 'trigliceridos', name: 'Triglicéridos', unit: 'mg/dL', category: 'Lípidos', direction: 'lower', description: 'Gorduras circulantes no sangue.' },

  { id: 'hemoglobina_glicada', name: 'Hemoglobina Glicada', unit: '%', category: 'Glicose', direction: 'lower', description: 'HbA1c, média aproximada da glicose nos últimos meses.' },
  { id: 'glicemia_media_estimada', name: 'Glicemia Média Estimada', unit: 'mg/dL', category: 'Glicose', direction: 'lower', description: 'Estimativa de glicemia média associada à HbA1c.' },
  { id: 'glicemia', name: 'Glicémia', unit: 'mg/dL', category: 'Glicose', direction: 'range', description: 'Glicose no sangue no momento da colheita.' },

  { id: 'psa_total', name: 'PSA Total', unit: 'ng/mL', category: 'Próstata', direction: 'lower', description: 'Antigénio específico da próstata total.' },
  { id: 'psa_livre', name: 'PSA Livre', unit: 'ng/mL', category: 'Próstata', direction: 'range', description: 'Fração livre do PSA.' },
  { id: 'ratio_psa_l', name: 'Ratio PSA L', unit: '%', category: 'Próstata', direction: 'range', description: 'Rácio entre PSA livre e PSA total.' }
]

export const defaultBehaviours = [
  { id: 'peixe', label: 'Peixe', category: 'Proteína' },
  { id: 'carne_branca', label: 'Carne branca', category: 'Proteína' },
  { id: 'carne_vermelha', label: 'Carne vermelha', category: 'Proteína' },
  { id: 'enchidos_carnes_processadas', label: 'Enchidos ou carnes processadas', category: 'Sal / Fósforo' },
  { id: 'marisco', label: 'Marisco', category: 'Proteína / Fósforo' },
  { id: 'ovos_claras', label: 'Ovos ou claras', category: 'Proteína' },
  { id: 'laticinios', label: 'Laticínios', category: 'Fósforo / Potássio' },
  { id: 'iogurtes_proteina', label: 'Iogurtes proteicos', category: 'Fósforo / Proteína' },
  { id: 'leguminosas', label: 'Leguminosas', category: 'Potássio / Fósforo' },
  { id: 'frutos_secos_sementes', label: 'Frutos secos ou sementes', category: 'Fósforo / Potássio' },
  { id: 'batata_tomate_espinafres', label: 'Batata, tomate ou espinafres', category: 'Potássio' },
  { id: 'fruta_rica_potassio', label: 'Fruta rica em potássio', category: 'Potássio' },
  { id: 'fruta_baixa_potassio', label: 'Fruta baixa em potássio', category: 'Potássio' },
  { id: 'legumes_baixo_potassio', label: 'Legumes baixos em potássio', category: 'Potássio' },
  { id: 'alimentos_salgados', label: 'Alimentos salgados', category: 'Sódio / Líquidos' },
  { id: 'refeicao_fora_fast_food', label: 'Refeição fora ou fast-food', category: 'Sódio / Fósforo' },
  { id: 'refrigerantes_cola', label: 'Refrigerantes tipo cola', category: 'Fósforo' },
  { id: 'doces_pastelaria', label: 'Doces ou pastelaria', category: 'Glicemia / Lípidos' },
  { id: 'excesso_liquidos', label: 'Líquidos acima do limite', category: 'Líquidos / Sódio' },
  { id: 'quelante_fosforo_refeicoes', label: 'Quelante do fósforo à refeição', category: 'Tratamento / Fósforo' }
]

export const defaultReferences = Object.fromEntries(
  biomarkers.map((b) => [b.id, {
    sufficientMin: '',
    sufficientMax: '',
    idealMin: '',
    idealMax: '',
    direction: b.direction
  }])
)

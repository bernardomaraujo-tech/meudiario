export const biomarkers = [
  { id: 'hemoglobina', name: 'Hemoglobina', aliases: ['Hb'], unit: 'g/dL', category: 'Hemograma', direction: 'range', description: 'Proteína dos glóbulos vermelhos responsável pelo transporte de oxigénio.' },
  { id: 'eritrocitos', name: 'Eritrócitos', aliases: ['Eritrocitos'], unit: '10^6/uL', category: 'Hemograma', direction: 'range', description: 'Contagem de glóbulos vermelhos.' },
  { id: 'hematocrito', name: 'Hematócrito', aliases: ['Hematocrito'], unit: '%', category: 'Hemograma', direction: 'range', description: 'Percentagem do volume do sangue ocupada por glóbulos vermelhos.' },
  { id: 'vgm', name: 'V.G.M.', aliases: ['V-G.M.', 'VGM'], unit: 'fL', category: 'Hemograma', direction: 'range', description: 'Volume globular médio dos eritrócitos.' },
  { id: 'hgm', name: 'H.G.M.', aliases: ['HGM'], unit: 'pg', category: 'Hemograma', direction: 'range', description: 'Hemoglobina globular média.' },
  { id: 'cmhg', name: 'C.M.H.G.', aliases: ['CMHG'], unit: 'g/dL', category: 'Hemograma', direction: 'range', description: 'Concentração média de hemoglobina globular.' },
  { id: 'rdw', name: 'R.D.W', aliases: ['RDW'], unit: '%', category: 'Hemograma', direction: 'range', description: 'Variação do tamanho dos eritrócitos.' },
  { id: 'leucocitos', name: 'Leucócitos', aliases: ['Leucocitos'], unit: '10^3/uL', category: 'Hemograma', direction: 'range', description: 'Contagem total de glóbulos brancos.' },
  { id: 'neutrofilos', name: 'Neutrófilos', aliases: ['Neutrofilos'], unit: '10^3/uL', category: 'Hemograma', direction: 'range', description: 'Contagem de neutrófilos, um tipo de glóbulo branco.' },
  { id: 'eosinofilos', name: 'Eosinófilos', aliases: ['Eosinofilos'], unit: '10^3/uL', category: 'Hemograma', direction: 'range', description: 'Contagem de eosinófilos, associados a alergias, parasitas e resposta imunitária.' },
  { id: 'basofilos', name: 'Basófilos', aliases: ['Basofilos'], unit: '10^3/uL', category: 'Hemograma', direction: 'range', description: 'Contagem de basófilos, um tipo menos frequente de glóbulo branco.' },
  { id: 'linfocitos', name: 'Linfócitos', aliases: ['Linfocitos'], unit: '10^3/uL', category: 'Hemograma', direction: 'range', description: 'Contagem de linfócitos, relevantes para a resposta imunitária.' },
  { id: 'monocitos', name: 'Monócitos', aliases: ['Monocitos'], unit: '10^3/uL', category: 'Hemograma', direction: 'range', description: 'Contagem de monócitos, células envolvidas na resposta inflamatória e imunitária.' },
  { id: 'plaquetas', name: 'Plaquetas', aliases: ['Plaquetas'], unit: '10^3/uL', category: 'Hemograma', direction: 'range', description: 'Contagem de plaquetas, relevantes para coagulação.' },

  { id: 'ferro_serico', name: 'Ferro Sérico', aliases: ['Ferro Serico'], unit: 'ug/dL', category: 'Ferro e Anemia', direction: 'range', description: 'Ferro circulante no sangue.' },
  { id: 'ferritina', name: 'Ferritina', aliases: ['Ferritina'], unit: 'ng/mL', category: 'Ferro e Anemia', direction: 'range', description: 'Marcador de reservas de ferro.' },
  { id: 'capacidade_fixacao_ferro', name: 'Capacidade Fixação do Ferro', aliases: ['Capacidade Fixacao do Ferro', 'Capacidade de Fixação do Ferro'], unit: 'ug/dL', category: 'Ferro e Anemia', direction: 'range', description: 'Capacidade total de ligação/transporte de ferro.' },
  { id: 'sideremia', name: 'Siderémia', aliases: ['Sideremia'], unit: 'ug/dL', category: 'Ferro e Anemia', direction: 'range', description: 'Concentração de ferro no soro.' },

  { id: 'proteina_c_reactiva', name: 'Proteína C Reactiva', aliases: ['Proteina C Reactiva', 'Proteína C Reativa', 'Proteina C Reativa', 'PCR'], unit: 'mg/L', category: 'Inflamação', direction: 'lower', description: 'Marcador de inflamação sistémica.' },

  { id: 'ureia_pre_dialise', name: 'Ureia (pré diálise)', aliases: ['Ureia (pré dialise)', 'Ureia pre dialise', 'Ureia pré diálise'], unit: 'mg/dL', category: 'Rim e Diálise', direction: 'lower', description: 'Ureia antes da sessão de diálise.' },
  { id: 'ureia_pos_dialise', name: 'Ureia (pós diálise)', aliases: ['Ureia (pós dialise)', 'Ureia pos dialise', 'Ureia pós diálise'], unit: 'mg/dL', category: 'Rim e Diálise', direction: 'lower', description: 'Ureia depois da sessão de diálise.' },
  { id: 'creatininemia', name: 'Creatininémia', aliases: ['Criatinémia', 'Creatininemia', 'Criatinemia'], unit: 'mg/dL', category: 'Rim e Diálise', direction: 'range', description: 'Creatinina sérica, influenciada por função renal e massa muscular.' },
  { id: 'acido_urico', name: 'Ácido Úrico', aliases: ['Ácido Urico', 'Acido Urico'], unit: 'mg/dL', category: 'Rim e Diálise', direction: 'lower', description: 'Produto do metabolismo das purinas.' },

  { id: 'albumina', name: 'Albumina', aliases: ['Albumina'], unit: 'g/dL', category: 'Nutrição', direction: 'higher', description: 'Proteína plasmática associada ao estado nutricional e inflamatório.' },
  { id: 'proteinas_totais', name: 'Proteínas Totais', aliases: ['Proteinas Totais'], unit: 'g/dL', category: 'Nutrição', direction: 'range', description: 'Soma das principais proteínas circulantes no sangue.' },

  { id: 'alanina_aminotransferase', name: 'Alanina aminotransferase', aliases: ['ALT', 'TGP', 'Alanina Aminotransferase'], unit: 'U/L', category: 'Fígado', direction: 'lower', description: 'Enzima hepática frequentemente abreviada ALT.' },
  { id: 'fosfatase_alcalina', name: 'Fosfatase alcalina', aliases: ['Fosfatase Alcalina', 'FA'], unit: 'U/L', category: 'Fígado', direction: 'range', description: 'Enzima associada a fígado, vias biliares e osso.' },

  { id: 'sodio', name: 'Sódio', aliases: ['Sodio', 'Na'], unit: 'mmol/L', category: 'Eletrólitos e Minerais', direction: 'range', description: 'Eletrólito essencial para equilíbrio hídrico e função neuromuscular.' },
  { id: 'magnesio', name: 'Magnésio', aliases: ['Magnesio', 'Mg'], unit: 'mg/dL', category: 'Eletrólitos e Minerais', direction: 'range', description: 'Mineral envolvido em função muscular, nervosa e metabólica.' },
  { id: 'potassio', name: 'Potássio', aliases: ['Potassio', 'Potacio', 'K'], unit: 'mmol/L', category: 'Eletrólitos e Minerais', direction: 'range', description: 'Eletrólito essencial para função cardíaca, muscular e equilíbrio celular. Em contexto de hemodiálise deve ser acompanhado com atenção.' },
  { id: 'calcio_total', name: 'Cálcio Total', aliases: ['Calcio Total', 'Cálcio', 'Calcio'], unit: 'mg/dL', category: 'Eletrólitos e Minerais', direction: 'range', description: 'Mineral importante para os ossos, contração muscular e equilíbrio mineral, especialmente relevante na doença renal crónica.' },
  { id: 'fosforo_inorganico', name: 'Fósforo Inorgânico', aliases: ['Fosforo Inorganico', 'Fósforo', 'Fosforo'], unit: 'mg/dL', category: 'Eletrólitos e Minerais', direction: 'range', description: 'Mineral fortemente influenciado pela alimentação e pela diálise. Valores elevados são comuns em insuficiência renal.' },

  { id: 'colesterol_total', name: 'Colesterol Total', aliases: ['Colesterol Total'], unit: 'mg/dL', category: 'Lípidos', direction: 'lower', description: 'Mede a quantidade total de colesterol no sangue.' },
  { id: 'colesterol_ldl', name: 'Colesterol LDL', aliases: ['LDL', 'Colesterol LDL'], unit: 'mg/dL', category: 'Lípidos', direction: 'lower', description: 'Conhecido como colesterol LDL, associado ao risco cardiovascular quando elevado.' },
  { id: 'colesterol_hdl', name: 'Colesterol HDL', aliases: ['HDL', 'Colesterol HDL'], unit: 'mg/dL', category: 'Lípidos', direction: 'higher', description: 'Conhecido como colesterol HDL, geralmente considerado protetor cardiovascular.' },
  { id: 'trigliceridos', name: 'Triglicéridos', aliases: ['Trigliceridos'], unit: 'mg/dL', category: 'Lípidos', direction: 'lower', description: 'Tipo de gordura no sangue, influenciado por alimentação, metabolismo e controlo glicémico.' },

  { id: 'hemoglobina_glicada', name: 'Hemoglobina Glicada', aliases: ['HbA1c', 'Hemoglobina Glicada'], unit: '%', category: 'Glicose', direction: 'range', description: 'Indicador da média da glicemia nos últimos meses.' },
  { id: 'glicemia_media_estimada', name: 'Glicemia Média Estimada', aliases: ['Glicemia Media Estimada'], unit: 'mg/dL', category: 'Glicose', direction: 'range', description: 'Estimativa da glicemia média calculada a partir da hemoglobina glicada.' },
  { id: 'glicemia', name: 'Glicémia', aliases: ['Glicemia'], unit: 'mg/dL', category: 'Glicose', direction: 'range', description: 'Mede a concentração de glicose no sangue.' },

  { id: 'psa_total', name: 'PSA Total', aliases: ['PSA Total'], unit: 'ng/mL', category: 'Próstata', direction: 'lower', description: 'Marcador usado no acompanhamento prostático.' },
  { id: 'psa_livre', name: 'PSA Livre', aliases: ['PSA Livre'], unit: 'ng/mL', category: 'Próstata', direction: 'range', description: 'Fração livre do PSA, usada em conjunto com o PSA total.' },
  { id: 'ratio_psa_l', name: 'Ratio PSA L', aliases: ['Ratio PSA L', 'Rácio PSA Livre', 'Ratio PSA Livre'], unit: '', category: 'Próstata', direction: 'range', description: 'Rácio entre PSA livre e PSA total.' },

  { id: 'paratormona_pth', name: 'Paratormona PTH', aliases: ['Paratomona PTH', 'Paratormona', 'Parathormona', 'PTH'], unit: 'pg/mL', category: 'Osso e Mineral', direction: 'range', description: 'Hormona envolvida no equilíbrio do cálcio e fósforo. Muito relevante em doentes em hemodiálise.' }
]

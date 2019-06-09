const tags = [
  // Paraklinik
  { value: 'radiologi', text: 'Radiologi', category: 'paraklinik' },
  { value: 'a-gas', text: 'A-gas', category: 'paraklinik' },
  { value: 'patologi', text: 'Patologi', category: 'paraklinik' },

  // Reumatologi
  { value: 'artritis_og_artrose', text: 'Artritis og artrose', category: 'reumatologi' },
  { value: 'bindevævssygdomme', text: 'Bindevævssygdomme', category: 'reumatologi' },
  { value: 'vaskulitis', text: 'Vaskulitis', category: 'reumatologi' },
  { value: 'lænderygsygdomme', text: 'Lænderygsygdomme', category: 'reumatologi' },

  // Gastroenterologi
  { value: 'reflux', text: 'Reflux', category: 'gastroenterologi' },
  { value: 'ulcus', text: 'Ulcus', category: 'gastroenterologi' },
  {
    value: 'inflammatoriske_tarmsygdomme',
    text: 'Inflammatoriske tarmsygdomme',
    category: 'gastroenterologi'
  },
  { value: 'cøliaki', text: 'Cøliaki', category: 'gastroenterologi' },
  { value: 'lever', text: 'Lever og galdeveje', category: 'gastroenterologi' },
  { value: 'pancreas', text: 'Pancreas', category: 'gastroenterologi' },

  // Hæmatologi
  { value: 'anæmi', text: 'Anæmi', category: 'hæmatologi' },
  { value: 'trombocytopeni', text: 'Trombocytopeni', category: 'hæmatologi' },
  { value: 'leukæmi', text: 'Leukæmi', category: 'hæmatologi' },
  { value: 'lymfom', text: 'Lymfom', category: 'hæmatologi' },
  { value: 'myelodysplastisk_syndrom', text: 'Myelodysplastisk syndrom', category: 'hæmatologi' },
  {
    value: 'myeloproliferative_neoplasier',
    text: 'Myeloproliferative neoplasier',
    category: 'hæmatologi'
  },
  { value: 'myelomatose', text: 'Plasmacellesygdomme', category: 'hæmatologi' },

  // Klinisk immunologi
  { value: 'blodtransfusion', text: 'Blodtransfusion', category: 'klinisk immunologi' },
  { value: 'Transplantation', text: 'Transplantation', category: 'klinisk immunologi' },
  { value: 'Immundefekt', text: 'Immundefekter', category: 'klinisk immunologi' },

  // Klinisk biokemi
  { value: 'blodprøvetolkning', text: 'Blodprøvetolkning', category: 'klinisk biokemi' },
  { value: 'koagulopati', text: 'Koagulopati', category: 'klinisk biokemi' },

  // Specifikke sygdomme
  { value: 'syfilis', text: 'Syfilis', category: 'infektionsmedicin' },
  { value: 'sepsis', text: 'Sepsis', category: 'infektionsmedicin' },
  { value: 'neuroinfektioner', text: 'Neuroinfektioner', category: 'infektionsmedicin' },
  { value: 'luftvejsinfektioner', text: 'Luftvejsinfektioner', category: 'infektionsmedicin' },

  // Diverse
  { value: 'journaloptagelse', text: 'Journaloptagelse', category: 'diverse' },
  { value: 'farmakologi', text: 'Farmakologi', category: 'diverse' },
  { value: 'statistik', text: 'Statistik', category: 'diverse' },
  { value: 'forskning', text: 'Forskning', category: 'diverse' },
  { value: 'molekylærbiologisk_metode', text: 'Molekylærbiologisk metode', category: 'diverse' },
  { value: 'børn', text: 'Børn', category: 'diverse' }
];
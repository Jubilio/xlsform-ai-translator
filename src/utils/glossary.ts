export const HUMANITARIAN_GLOSSARY_EN_PT: Record<string, string> = {
  "Household": "Agregado familiar",
  "Household member": "Membro do agregado familiar",
  "Respondent": "Inquirido",
  "Enumerator": "Inquiridor",
  "Food Security": "Segurança alimentar",
  "Food Consumption Score": "Índice de Consumo Alimentar",
  "Reduced Coping Strategies Index": "Índice Reduzido de Estratégias de Sobrevivência",
  "Livelihood Coping Strategies": "Estratégias de sobrevivência dos meios de subsistência",
  "Coping strategies": "Estratégias de sobrevivência",
  "Livelihoods": "Meios de subsistência",
  "Water point": "Fonte de água",
  "Drinking water": "Água para consumo",
  "Water source": "Fonte de água",
  "Sanitation facility": "Instalação sanitária",
  "Host community": "Comunidade de acolhimento",
  "Internally displaced person": "Pessoa deslocada internamente",
  "Displaced household": "Agregado familiar deslocado",
  "Returnee": "Retornado",
  "Area of origin": "Área de origem",
  "Current location": "Localização actual",
  "Shelter": "Abrigo",
  "Non-food items": "Artigos não alimentares",
  "Protection": "Protecção",
  "Health facility": "Unidade sanitária",
  "Primary health care": "Cuidados de saúde primários",
  "Disability": "Deficiência",
  "Do not know": "Não sabe",
  "Prefer not to answer": "Prefere não responder",
  "Other, specify": "Outro, especifique",
  "Yes": "Sim",
  "No": "Não"
};

export function getBuiltInGlossary(sourceCode: string, targetCode: string): Record<string, string> {
  if (sourceCode.toLowerCase().startsWith("en") && targetCode.toLowerCase().startsWith("pt")) {
    return { ...HUMANITARIAN_GLOSSARY_EN_PT };
  }
  return {};
}

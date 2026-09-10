import { getActiveBrand } from "@/lib/brand";

function paletteToCss(prefix: string, palette: ReturnType<typeof getActiveBrand>["tokens"]["light"]) {
  return [
    `${prefix}--indigo:${palette.indigo}`,
    `${prefix}--indigo-600:${palette.indigo600}`,
    `${prefix}--indigo-500:${palette.indigo500}`,
    `${prefix}--indigo-soft:${palette.indigoSoft}`,
    `${prefix}--indigo-page:${palette.indigoPage}`,
    `${prefix}--indigo-page-soft:${palette.indigoPageSoft}`,
  ].join(";");
}

export function BrandTheme() {
  const brand = getActiveBrand();
  const css = `html[data-brand="${brand.id}"]{${paletteToCss("", brand.tokens.light)}}html[data-brand="${brand.id}"].dark{${paletteToCss("", brand.tokens.dark)}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

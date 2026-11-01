import { cmsRoute } from "@/components/storefront/content/cms-page";

// Content managed in Admin → Pages (slug "return-policy").
const { generateMetadata, CmsPage } = cmsRoute("return-policy");

export { generateMetadata };
export default CmsPage;

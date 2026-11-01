import { cmsRoute } from "@/components/storefront/content/cms-page";

// Content managed in Admin → Pages (slug "size-guide").
const { generateMetadata, CmsPage } = cmsRoute("size-guide");

export { generateMetadata };
export default CmsPage;

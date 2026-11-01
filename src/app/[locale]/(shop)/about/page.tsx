import { cmsRoute } from "@/components/storefront/content/cms-page";

// Content managed in Admin → Pages (slug "about").
const { generateMetadata, CmsPage } = cmsRoute("about");

export { generateMetadata };
export default CmsPage;

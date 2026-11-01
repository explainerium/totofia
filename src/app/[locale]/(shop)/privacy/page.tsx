import { cmsRoute } from "@/components/storefront/content/cms-page";

// Content managed in Admin → Pages (slug "privacy").
const { generateMetadata, CmsPage } = cmsRoute("privacy");

export { generateMetadata };
export default CmsPage;

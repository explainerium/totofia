import { cmsRoute } from "@/components/storefront/content/cms-page";

// Content managed in Admin → Pages (slug "terms").
const { generateMetadata, CmsPage } = cmsRoute("terms");

export { generateMetadata };
export default CmsPage;

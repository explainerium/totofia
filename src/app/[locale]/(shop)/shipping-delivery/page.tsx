import { cmsRoute } from "@/components/storefront/content/cms-page";

// Content managed in Admin → Pages (slug "shipping-delivery").
const { generateMetadata, CmsPage } = cmsRoute("shipping-delivery");

export { generateMetadata };
export default CmsPage;

import { SVGProps } from "react";

const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 25 18"
        fill="none"
        {...props}
    >
        <path
            className="fill-pink-600"
            fillRule="evenodd"
            d="m9 0 9 18H0L9 0Z"
            clipRule="evenodd"
        />
        <path
            className="fill-blue-500"
            fillRule="evenodd"
            d="m15.218 0 9 18h-18l9-18Z"
            clipRule="evenodd"
        />
        <path
            className="fill-black dark:fill-white"
            d="M18 18H6.218l5.89-11.782L18 18Z"
        />
    </svg>
)
export default LogoIcon;


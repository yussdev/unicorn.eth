import { SVGProps } from 'react'

export const QuestionCircleIcon: React.FC<SVGProps<SVGSVGElement>> = ({
  ...props
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M6.18733 6.47933C6.18719 6.16504 6.26878 5.8561 6.42408 5.58285C6.57938 5.3096 6.80306 5.08143 7.07317 4.92073C7.34327 4.76002 7.65052 4.67231 7.96476 4.6662C8.279 4.66009 8.58943 4.7358 8.86558 4.88588C9.14173 5.03596 9.37411 5.25527 9.53991 5.52227C9.70572 5.78928 9.79925 6.09481 9.81133 6.40887C9.82341 6.72294 9.75361 7.03475 9.6088 7.3137C9.46399 7.59265 9.24914 7.82915 8.98533 8C8.50267 8.31333 8 8.758 8 9.33333M8 11.3333H8.00067M14 8C14 8.78793 13.8448 9.56815 13.5433 10.2961C13.2417 11.0241 12.7998 11.6855 12.2426 12.2426C11.6855 12.7998 11.0241 13.2417 10.2961 13.5433C9.56815 13.8448 8.78793 14 8 14C7.21207 14 6.43185 13.8448 5.7039 13.5433C4.97595 13.2417 4.31451 12.7998 3.75736 12.2426C3.20021 11.6855 2.75825 11.0241 2.45672 10.2961C2.15519 9.56815 2 8.78793 2 8C2 6.4087 2.63214 4.88258 3.75736 3.75736C4.88258 2.63214 6.4087 2 8 2C9.5913 2 11.1174 2.63214 12.2426 3.75736C13.3679 4.88258 14 6.4087 14 8Z"
      stroke="#9B9BA7"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
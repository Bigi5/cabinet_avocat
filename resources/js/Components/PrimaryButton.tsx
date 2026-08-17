import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: Readonly<ButtonHTMLAttributes<HTMLButtonElement>>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ease-in-out hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    className
                }`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

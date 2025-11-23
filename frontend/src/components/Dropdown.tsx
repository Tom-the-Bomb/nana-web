import arrow from '../assets/arrow.svg';

export default function Dropdown({header, content}: {header: React.ReactNode, content: React.ReactNode}) {
    return (
        <details className="open:[&>summary>img.arrow-cls]:-rotate-180 flex flex-col gap-2">
            <summary className="flex items-center text-lg gap-2">
                {header}
                <img
                    className="arrow-cls rotate-0 transform transition-all duration-300"
                    src={arrow} alt="[v]"
                />
            </summary>
            {content}
        </details>
    );
}
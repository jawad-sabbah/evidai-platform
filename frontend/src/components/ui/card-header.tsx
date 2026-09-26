
export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;

  description: string;

  action?:
    React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h2 className="text-[17px] font-semibold text-[#26312C]">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-[#87918C]">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

interface ProfileCardProps {
  image: string;
  name: string;
  age: number;
  flag: string;
  online?: boolean;
  className?: string;
}

export default function ProfileCard({ image, name, age, flag, online = true, className = "" }: ProfileCardProps) {
  return (
    <div className={`relative rounded-2xl overflow-hidden group ${className}`}>
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Online badge */}
      {online && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span className="w-2 h-2 rounded-full bg-[hsl(142_70%_45%)] animate-pulse" />
          <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Online</span>
        </div>
      )}

      {/* Name & info */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
        <span className="text-base">{flag}</span>
        <span className="text-white font-semibold text-sm drop-shadow-lg">
          {name}, {age}
        </span>
      </div>
    </div>
  );
}

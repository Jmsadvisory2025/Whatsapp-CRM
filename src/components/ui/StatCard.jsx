import Card from "./Card";

const StatCard = ({ icon, value, label, color, onClick }) => {
  return (
    <Card
      className={`flex items-center justify-between p-4 rounded-2xl shadow-sm transition 
        ${onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : ""}`}
      onClick={onClick}
    >
      {/* Left side: value + label */}
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>

      {/* Right side: icon with background */}
      <div
        className="flex items-center justify-center p-3 rounded-lg"
        style={{
          backgroundColor: color,
          color: color,
        }}
      >
        {typeof icon === "string" ? (
          <img src={icon} alt={label} className="w-6 h-6 object-contain" />
        ) : (
          icon
        )}
      </div>
    </Card>
  );
};

export default StatCard;

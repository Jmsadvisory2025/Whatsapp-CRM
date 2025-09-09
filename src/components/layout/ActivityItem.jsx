const ActivityItem = ({ type, name, time, color }) => (
  <div className="flex items-start space-x-3 py-3">
    <div
      className={`mt-1 w-2.5 h-2.5 rounded-full bg-${color}-500 flex-shrink-0`}
    ></div>
    <div>
      <p className="font-medium text-text-primary">
        {type} from {name}
      </p>
      <p className="text-sm text-text-secondary">{time}</p>
    </div>
  </div>
);
export default ActivityItem;
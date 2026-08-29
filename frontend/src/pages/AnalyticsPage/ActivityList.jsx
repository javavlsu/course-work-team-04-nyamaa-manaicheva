import { Check, Plus, Share2 } from "lucide-react";

import { recentActivity } from "../../lib/utils/mockData";

const ICONS = {
  create: Plus,
  complete: Check,
  share: Share2,
};

function ActivityList() {
  return (
    <div className="activity-list">
      {recentActivity.map((item) => {
        const Icon = ICONS[item.type];
        return (
          <div className="activity-item" key={item.text}>
            <div className={`activity-icon ${item.type}`}>
              <Icon strokeWidth={1.6} />
            </div>
            <span className="activity-text">{item.text}</span>
            <span className="activity-time">{item.time}</span>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityList;

import React from 'react';
import { AuditEvent } from '../types';
import { formatDateTime } from '../utils/format';
import { Clock } from 'lucide-react';

interface AuditTimelineProps {
  events: AuditEvent[];
}

const formatEventType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const AuditTimeline: React.FC<AuditTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return <div className="text-gray-500 text-sm italic">No events found.</div>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatEventType(event.eventType)}</p>
                    {event.eventDetail && <p className="mt-1 text-sm text-gray-500">{event.eventDetail}</p>}
                    {event.metadata && (
                      <p className="mt-1 text-xs text-gray-400 font-mono break-all bg-gray-50 p-2 rounded">
                        {event.metadata}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-gray-500">
                    <time dateTime={event.occurredAt}>{formatDateTime(event.occurredAt)}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuditTimeline;

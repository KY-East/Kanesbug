import Image from 'next/image';
import { format } from 'date-fns';

interface LogEntry {
  id: string;
  photoURL: string;
  note: string;
  createdAt: { seconds: number };
}

interface TimelineItemProps {
  entry: LogEntry;
}

export default function TimelineItem({ entry }: TimelineItemProps) {
  // 将 Firestore 时间戳转换为 JavaScript Date 对象
  const date = new Date(entry.createdAt.seconds * 1000);
  
  return (
    <div className="kid-card hover:border-green-300 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-48 h-48">
          <div className="absolute inset-0 rounded-lg overflow-hidden border-2 border-blue-200">
            <Image
              src={entry.photoURL}
              alt="独角仙照片"
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">📅</span>
            <p className="text-blue-600 font-medium">
              {format(date, "yyyy年MM月dd日 HH:mm")}
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg my-2">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {entry.note}
            </p>
          </div>
          
          <div className="flex justify-end">
            <span className="text-xs text-gray-500 italic">
              Kane的第 {Math.floor(Math.random() * 100) + 1} 次观察
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
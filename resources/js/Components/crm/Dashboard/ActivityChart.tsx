import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ActivityItem {
  date: string;
  actes: number;
  documents: number;
  echeances: number;
  factures: number;
  transmissions: number;
  total: number;
}

interface Props {
  data: ActivityItem[];
}

export default function ActivityChart({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-5">
        Activité de la semaine
      </h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Area
              dataKey="total"
              stroke="#B08D57"
              fill="#B08D57"
              fillOpacity={0.20}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
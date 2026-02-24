import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CountriesTableProps {
  data: { country: string; visitors: number; percentage: number }[]
}

export function CountriesTable({ data }: CountriesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Countries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Visitors</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.country}>
                <TableCell className="font-medium">{row.country}</TableCell>
                <TableCell className="text-right">
                  {row.visitors.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">{row.percentage}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

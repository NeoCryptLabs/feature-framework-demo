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

interface TopPagesProps {
  data: { path: string; views: number; uniqueVisitors: number }[]
}

export function TopPages({ data }: TopPagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Unique Visitors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((page) => (
              <TableRow key={page.path}>
                <TableCell className="font-medium">{page.path}</TableCell>
                <TableCell className="text-right">
                  {page.views.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {page.uniqueVisitors.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

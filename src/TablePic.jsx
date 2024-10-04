import React, { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Pagination,
} from "@nextui-org/react";

// Define columns
const columns = [
  { name: "NAME", uid: "name" },
  { name: "TOTAL COST", uid: "totalCost" },
  { name: "EQUIPMENTS COST", uid: "equipmentsCost" },
  { name: "INVOICES", uid: "invoices" },
  { name: "STATUS", uid: "status" },
];

const TablePic = ({ rows, colorsta,theme }) => {
  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 4; // Set the number of rows per page

  // Calculate the total number of pages
  const pages = Math.ceil(rows.length / rowsPerPage);

  // Get the current page items
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return rows.slice(start, end);
  }, [page, rows]);

  // Function to render cells based on the column key
  const renderCell = useCallback(
    (row, columnKey) => {
      const cellValue = row[columnKey];
      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{ radius: "lg", src: `https://api.dynamofleet.com/uploads/${row.pic}` }}
              name={`${row.firstName} ${row.lastName}`}
            />
          );
        case "totalCost":
          return row["Total cost"];
        case "equipmentsCost":
          return row.value.Equipments_Cost;
        case "invoices":
          return row.value.Invoices;
        case "status":
          return (
            <Chip
              className="capitalize"
              style={{ backgroundColor: colorsta[row.tag], color: 'white' }}
              size="sm"
              variant="flat"
            >
              {row.tag}
            </Chip>
          );
        default:
          return cellValue;
      }
    },
    [colorsta]
  );

  return (
    
    <Table
    className={`${theme === 'dark' ? 'dark' : 'light'} ${theme === 'dark' ? 'text-white' : 'black'}`}
      aria-label="Example  table with custom cells and pagination"
      bottomContent={
        <div className="flex w-full  justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
      classNames={{
        wrapper: "min-h-[380px] ", // Set the minimum height to 400px
      }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={items}>
        {(item) => (
          <TableRow key={item.id} >
            {(columnKey) => <TableCell >{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TablePic;

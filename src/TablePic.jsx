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



const TablePic = ({ rows, colorsta,theme,lan }) => {
 // Define columns
const columns = [
  { name: lan==="US"?"Name":"Name", uid: "name" },
  { name: lan==="US"?"Total cost":"Gesamtkosten", uid: "totalCost" },
  { name: lan==="US"?"Equipment costs":"Ausrüstungskosten", uid: "equipmentsCost" },
  { name: lan==="US"?"Invoices":"Rechnungen", uid: "invoices" },
  { name: lan==="US"?"Current status":"Aktueller Status", uid: "status" },
];
  const [page, setPage] = useState(1);
  const rowsPerPage = 4; // Set the number of rows per page

  // Calculate the total number of pages
  const pages = Math.ceil(rows.length / rowsPerPage);

  const items = useMemo(() => {
    const sortedRows = [...rows].sort((a, b) => b["Total cost"] - a["Total cost"]); // Sort by "Total cost" in descending order
  
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedRows.slice(start, end);
  }, [page, rows]);
  
  
  const statusTranslations = {
    "Active": "Aktiv",
    "Inactive": "Inaktiv",
    "Sick": "Krank",
    "Holiday": "Urlaub",
    "Over Hours": "Überstunden",
    "Work Accident": "Arbeitsunfall",
  };

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
          const displayTag = lan === "US" ? row.tag : statusTranslations[row.tag] || row.tag;
          return (
            <Chip
              className="capitalize"
              style={{ backgroundColor: colorsta[row.tag], color: '#661F52' }}
              size="sm"
              variant="flat"
            >
              {displayTag}
            </Chip>
          );
        default:
          return cellValue;
      }
    },
    [colorsta,lan,statusTranslations]
  );

  return (
    
    <Table
    key={lan}
    className={`${theme === 'dark' ? 'dark' : 'light'} ${theme === 'dark' ? 'text-white' : 'black'} shadow-2xl`}
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

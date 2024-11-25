import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, getKeyValue } from "@nextui-org/react";

export default function Tablei({ users,theme,lan }) {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 5; // Updated rows per page to 5

  const pages = Math.ceil(users.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return users.slice(start, end);
  }, [page, users]);

  return (
    
      <Table
      key={lan} 
      color="danger"
      selectionMode="single" 
      defaultSelectedKeys={["1"]} 
      className={`shadow-xl ${theme === 'dark' ? 'text-gray-50 dark' : ''}`}
        aria-label="Example table with client side pagination"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              initialPage={1}
              color="warning"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[389px]", // Set the minimum height to 400px
        }}
      >
        
        <TableHeader>
          <TableColumn key="type">{lan==="US"?"Equipment types":"Ausstattungstypen"}</TableColumn>
          <TableColumn key="item">{lan==="US"?"Item":"Artikel"}</TableColumn>
          <TableColumn key="quantity">{lan==="US"?"Quantity":"Menge"}</TableColumn>
          <TableColumn key="cost">{lan==="US"?"Total cost":"Gesamtkosten"}</TableColumn>
        </TableHeader>
     
        <TableBody emptyContent={"No rows to display."} items={items}  >
          {(item) => (
            <TableRow key={item.name} >
              {(columnKey) => <TableCell >{getKeyValue(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
  
  );
}

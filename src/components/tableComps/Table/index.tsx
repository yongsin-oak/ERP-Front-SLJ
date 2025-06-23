import { Table as ATable, TableProps } from "antd";

interface Props extends TableProps {
  limit?: number;
  total?: number;
  jumper?: boolean;
}
const Table = ({ limit = 10, total, jumper = true, ...props }: Props) => {
  return (
    <ATable
      pagination={{
        pageSize: limit,
        total: total,
        showQuickJumper: jumper,
      }}
      
      {...props}
    ></ATable>
  );
};

export default Table;

import { useState, useEffect } from "react";
import { employeeService } from "../services";
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from "../types";
import { message } from "antd";

export const useEmployee = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล",
      );
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (data: CreateEmployeeDto) => {
    try {
      await employeeService.create(data);
      message.success("เพิ่มพนักงานสำเร็จ");
      await fetchEmployees();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มพนักงาน",
      );
      throw error;
    }
  };

  const updateEmployee = async (id: string, data: UpdateEmployeeDto) => {
    try {
      await employeeService.update(id, data);
      message.success("อัพเดทข้อมูลสำเร็จ");
      await fetchEmployees();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "เกิดข้อผิดพลาดในการอัพเดทข้อมูล",
      );
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await employeeService.delete(id);
      message.success("ลบพนักงานสำเร็จ");
      await fetchEmployees();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "เกิดข้อผิดพลาดในการลบพนักงาน",
      );
      console.error("Failed to delete employee:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};

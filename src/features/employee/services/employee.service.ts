import req from "@lib/config/req";
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from "../types";

const BASE_URL = "/api/v1/employee";

export const employeeService = {
  // GET all employees
  async getAll(): Promise<Employee[]> {
    const response = await req.get<Employee[]>(BASE_URL);
    return response.data;
  },

  // GET employee by id
  async getById(id: string): Promise<Employee> {
    const response = await req.get<Employee>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // POST create employee (SuperAdmin only)
  async create(data: CreateEmployeeDto): Promise<Employee> {
    const response = await req.post<Employee>(BASE_URL, data);
    return response.data;
  },

  // PATCH update employee (SuperAdmin only)
  async update(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const response = await req.patch<Employee>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // DELETE employee (SuperAdmin only)
  async delete(id: string): Promise<void> {
    await req.delete(`${BASE_URL}/${id}`);
  },
};

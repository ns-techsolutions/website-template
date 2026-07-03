"use client";

import { useQuery } from "@tanstack/react-query";

import { catalogKeys } from "../queries/catalog.keys";
import { catalogApi } from "../services/catalog-query.service";

export function useCatalogServices() {
  return useQuery({
    queryKey: catalogKeys.services(),
    queryFn: () => catalogApi.services(),
  });
}

export function useCatalogStaff() {
  return useQuery({
    queryKey: catalogKeys.staff(),
    queryFn: () => catalogApi.staff(),
  });
}

export function useCatalogHours() {
  return useQuery({
    queryKey: catalogKeys.hours(),
    queryFn: () => catalogApi.hours(),
  });
}

export function useAvailability(
  date: string | undefined,
  serviceId?: string,
  staffId?: string,
) {
  return useQuery({
    queryKey: catalogKeys.availability(date ?? "", serviceId, staffId),
    queryFn: () => catalogApi.availability(date as string, serviceId, staffId),
    enabled: !!date,
  });
}

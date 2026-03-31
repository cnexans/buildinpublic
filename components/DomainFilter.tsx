"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProjectStats } from "@/lib/posthog";

type ProjectFilterProps = {
  projects: ProjectStats[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

export function ProjectFilter({ projects, selected, onChange }: ProjectFilterProps) {
  const [open, setOpen] = React.useState(false);

  const allSelected = selected.length === 0;

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((n) => n !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {allSelected ? (
          <span className="text-muted-foreground">Todos los proyectos</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {selected.map((name) => (
              <Badge key={name} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar proyecto..." />
          <CommandList>
            <CommandEmpty>No se encontraron proyectos.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={clearAll}>
                <Checkbox checked={allSelected} className="mr-2" />
                <span className="font-medium">Todos</span>
              </CommandItem>
              {projects.map((project) => (
                <CommandItem key={project.name} onSelect={() => toggle(project.name)}>
                  <Checkbox
                    checked={selected.includes(project.name)}
                    className="mr-2"
                  />
                  <span className="truncate">{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Trash2, Plus, Palette } from 'lucide-react';

export interface ObjectMapping {
  id: string;
  name: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  tolerance?: number; // For fuzzy matching
}

export interface ObjectMappingData extends Record<string, unknown> {
  mappings: ObjectMapping[];
  findObjectByColor?: (targetRgb: { r: number; g: number; b: number }) => ObjectMapping | null;
}

interface ObjectMappingNodeProps extends NodeProps<Node<ObjectMappingData>> {}

export const ObjectMappingNode = ({ id, data, isConnectable }: ObjectMappingNodeProps) => {
  const [mappings, setMappings] = useState<ObjectMapping[]>(data?.mappings || []);
  const [newMapping, setNewMapping] = useState<Partial<ObjectMapping>>({
    name: '',
    rgb: { r: 255, g: 0, b: 0 },
    tolerance: 10
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Function to find object by RGB color with tolerance
  const findObjectByColor = useCallback((targetRgb: { r: number; g: number; b: number }): ObjectMapping | null => {
    for (const mapping of mappings) {
      const tolerance = mapping.tolerance || 10;
      const rDiff = Math.abs(mapping.rgb.r - targetRgb.r);
      const gDiff = Math.abs(mapping.rgb.g - targetRgb.g);
      const bDiff = Math.abs(mapping.rgb.b - targetRgb.b);
      
      // Use Euclidean distance for color matching
      const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
      
      if (distance <= tolerance) {
        return mapping;
      }
    }
    return null;
  }, [mappings]);

  // Function to convert RGB to hex for color input
  const rgbToHex = useCallback((rgb: { r: number; g: number; b: number }) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }, []);

  // Function to convert hex to RGB
  const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }, []);

  const addMapping = useCallback(() => {
    if (!newMapping.name) return;
    
    const mapping: ObjectMapping = {
      id: Date.now().toString(),
      name: newMapping.name,
      rgb: newMapping.rgb || { r: 255, g: 0, b: 0 },
      tolerance: newMapping.tolerance || 10
    };
    
    setMappings(prev => [...prev, mapping]);
    setNewMapping({
      name: '',
      rgb: { r: 255, g: 0, b: 0 },
      tolerance: 10
    });
  }, [newMapping]);

  const removeMapping = useCallback((mappingId: string) => {
    setMappings(prev => prev.filter(m => m.id !== mappingId));
  }, []);

  const updateMapping = useCallback((mappingId: string, updates: Partial<ObjectMapping>) => {
    setMappings(prev => prev.map(m => 
      m.id === mappingId ? { ...m, ...updates } : m
    ));
    setEditingId(null);
  }, []);

  // Expose the mapping functions to parent components via data
  const nodeData = useMemo((): ObjectMappingData => ({
    mappings,
    findObjectByColor
  } as any), [mappings, findObjectByColor]);

  // Update parent data when mappings change
  useEffect(() => {
    if (data) {
      Object.assign(data, nodeData);
    }
  }, [data, nodeData]);

  return (
    <Card className="w-[400px]">
      <CardHeader className="p-2 bg-blue-100 rounded-t-lg">
        <CardTitle className="text-sm text-center flex items-center justify-center gap-2">
          <Palette className="w-4 h-4" />
          Object Color Mapping
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Handle
          type="source"
          position={Position.Right}
          id="mappings"
          isConnectable={isConnectable}
          className="bg-blue-500"
        />

        {/* Add New Mapping Form */}
        <div className="mb-4 p-3 border rounded-lg bg-gray-50">
          <Label className="text-xs font-semibold mb-2 block">Add New Mapping</Label>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Object Name</Label>
              <Input
                placeholder="e.g., Person, Car, Tree"
                value={newMapping.name || ''}
                onChange={(e) => setNewMapping(prev => ({ ...prev, name: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Color</Label>
                <input
                  type="color"
                  value={rgbToHex(newMapping.rgb || { r: 255, g: 0, b: 0 })}
                  onChange={(e) => setNewMapping(prev => ({ 
                    ...prev, 
                    rgb: hexToRgb(e.target.value) 
                  }))}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Tolerance</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={newMapping.tolerance || 10}
                  onChange={(e) => setNewMapping(prev => ({ 
                    ...prev, 
                    tolerance: parseInt(e.target.value) || 10 
                  }))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <Button 
              onClick={addMapping} 
              size="sm" 
              className="w-full h-7 text-xs"
              disabled={!newMapping.name}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Mapping
            </Button>
          </div>
        </div>

        {/* Existing Mappings */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            Current Mappings ({mappings.length})
          </Label>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {mappings.map((mapping) => (
              <div key={mapping.id} className="flex items-center gap-2 p-2 border rounded text-xs">
                {editingId === mapping.id ? (
                  <div className="flex-1 space-y-1">
                    <Input
                      value={mapping.name}
                      onChange={(e) => updateMapping(mapping.id, { name: e.target.value })}
                      className="h-6 text-xs"
                    />
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={rgbToHex(mapping.rgb)}
                        onChange={(e) => updateMapping(mapping.id, { rgb: hexToRgb(e.target.value) })}
                        className="w-12 h-6 rounded border"
                      />
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={mapping.tolerance}
                        onChange={(e) => updateMapping(mapping.id, { tolerance: parseInt(e.target.value) || 10 })}
                        className="h-6 text-xs flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => setEditingId(null)}
                        className="h-6 px-2 text-xs"
                      >
                        ✓
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: rgbToHex(mapping.rgb) }}
                    />
                    <div className="flex-1 cursor-pointer" onClick={() => setEditingId(mapping.id)}>
                      <div className="font-medium">{mapping.name}</div>
                      <div className="text-gray-500">
                        RGB({mapping.rgb.r}, {mapping.rgb.g}, {mapping.rgb.b}) ±{mapping.tolerance}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMapping(mapping.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {mappings.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-4">
            No mappings defined. Add some object mappings above.
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
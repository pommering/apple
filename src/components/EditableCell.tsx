import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

interface EditableCellProps {
  value: number;
  onSave: (value: number) => Promise<void>;
  formatValue?: (value: number) => string;
  type?: 'currency' | 'number' | 'percentage';
  className?: string;
}

export function EditableCell({
  value,
  onSave,
  formatValue,
  type = 'currency',
  className = '',
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(value.toString());
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value.toString());
  };

  const handleSave = async () => {
    const numValue = parseFloat(editValue.replace(/[^\d.,-]/g, '').replace(',', '.'));

    if (isNaN(numValue) || numValue < 0) {
      handleCancel();
      return;
    }

    if (numValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(numValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      handleCancel();
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const defaultFormat = (val: number) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(val);
    } else if (type === 'percentage') {
      return `${val}%`;
    }
    return val.toString();
  };

  const displayValue = formatValue ? formatValue(value) : defaultFormat(value);

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
          title="Salvar"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className={`hover:bg-blue-50 px-2 py-1 rounded transition-colors text-left w-full ${className}`}
      title="Clique para editar"
    >
      {displayValue}
    </button>
  );
}

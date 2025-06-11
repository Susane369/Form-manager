import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

export interface Activity {
  id: string;
  type: 'form_created' | 'form_updated' | 'form_deleted' | 'response_submitted';
  formId: string;
  formTitle: string;
  timestamp: string;
  userId: string;
  userName: string;
  details?: Record<string, any>;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export type FormStatus = 'draft' | 'published' | 'archived';
export type FormType = 'survey' | 'quiz' | 'registration' | 'contact' | 'other';

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  status: FormStatus;
  type: FormType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  responsesCount?: number;
  lastResponseAt?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: {
    status: FormStatus[];
    types: FormType[];
    tags: string[];
    startDate: string;
    endDate: string;
    minResponses: number;
    maxResponses: number;
  };
  isDefault?: boolean;
}

interface FormContextType {
  // Operaciones de formularios existentes
  forms: Form[];
  currentForm: Form | null;
  activities: Activity[];
  addForm: (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  getFormById: (id: string) => Form | undefined;
  getRecentActivities: (limit?: number) => Activity[];
  exportFormData: (formId: string, format: 'csv' | 'json' | 'pdf') => void;
  exportAllForms: (format: 'csv' | 'json' | 'xlsx') => void;
  setCurrentForm: (form: Form | null) => void;
  
  // Operaciones para filtros guardados
  savedFilters: SavedFilter[];
  addSavedFilter: (filter: Omit<SavedFilter, 'id'>) => void;
  updateSavedFilter: (id: string, updates: Partial<SavedFilter>) => void;
  deleteSavedFilter: (id: string) => void;
  getSavedFilterById: (id: string) => SavedFilter | undefined;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(() => {
    const savedActivities = localStorage.getItem('formActivities');
    return savedActivities ? JSON.parse(savedActivities) : [];
  });

  const [forms, setForms] = useState<Form[]>(() => {
    // Datos de ejemplo para pruebas
    return [
      {
        id: '1',
        title: 'Encuesta de satisfacción',
        description: 'Encuesta para medir la satisfacción del cliente',
        fields: [
          { id: '1', type: 'text', label: 'Nombre', required: true },
          { id: '2', type: 'rating', label: 'Calificación', required: true }
        ],
        status: 'published',
        type: 'survey',
        tags: ['satisfacción', 'cliente'],
        responsesCount: 24,
        lastResponseAt: '2023-05-15T10:30:00Z',
        createdAt: '2023-01-10T09:00:00Z',
        updatedAt: '2023-05-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Registro para taller',
        description: 'Formulario de registro para el taller de programación',
        fields: [
          { id: '1', type: 'text', label: 'Nombre completo', required: true },
          { id: '2', type: 'email', label: 'Correo electrónico', required: true },
          { id: '3', type: 'select', label: 'Nivel de experiencia', options: ['Principiante', 'Intermedio', 'Avanzado'], required: true }
        ],
        status: 'draft',
        type: 'registration',
        tags: ['taller', 'programación'],
        responsesCount: 0,
        createdAt: '2023-02-20T14:15:00Z',
        updatedAt: '2023-02-20T14:15:00Z'
      },
      {
        id: '3',
        title: 'Cuestionario de conocimientos',
        description: 'Prueba tus conocimientos en React',
        fields: [
          { id: '1', type: 'multiple-choice', label: '¿Qué es el Virtual DOM?', options: ['Un DOM real', 'Una representación en memoria del DOM', 'Una librería de animaciones'], required: true },
          { id: '2', type: 'text', label: 'Explica el ciclo de vida de un componente', required: true }
        ],
        status: 'published',
        type: 'quiz',
        tags: ['react', 'evaluación'],
        responsesCount: 15,
        lastResponseAt: '2023-04-05T16:45:00Z',
        createdAt: '2023-03-01T10:00:00Z',
        updatedAt: '2023-04-05T16:45:00Z'
      },
      {
        id: '4',
        title: 'Formulario de contacto',
        description: 'Contáctanos para más información',
        fields: [
          { id: '1', type: 'text', label: 'Nombre', required: true },
          { id: '2', type: 'email', label: 'Correo electrónico', required: true },
          { id: '3', type: 'textarea', label: 'Mensaje', required: true }
        ],
        status: 'archived',
        type: 'contact',
        tags: ['contacto', 'información'],
        responsesCount: 8,
        lastResponseAt: '2023-01-25T11:20:00Z',
        createdAt: '2023-01-01T08:00:00Z',
        updatedAt: '2023-03-10T09:15:00Z'
      }
    ];
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    // Intentar cargar desde localStorage
    try {
      const saved = localStorage.getItem('savedFilters');
      return saved ? JSON.parse(saved) : [
        {
          id: 'default-active',
          name: 'Activos',
          isDefault: true,
          filters: {
            status: ['published'],
            types: [],
            tags: [],
            startDate: '',
            endDate: '',
            minResponses: 0,
            maxResponses: 100
          }
        },
        {
          id: 'default-drafts',
          name: 'Borradores',
          isDefault: true,
          filters: {
            status: ['draft'],
            types: [],
            tags: [],
            startDate: '',
            endDate: '',
            minResponses: 0,
            maxResponses: 100
          }
        }
      ];
    } catch (e) {
      console.error('Error loading saved filters', e);
      return [];
    }
  });

  const [currentForm, setCurrentForm] = useState<Form | null>(null);

  const logActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    const updatedActivities = [newActivity, ...activities].slice(0, 100); // Mantener solo las 100 actividades más recientes
    setActivities(updatedActivities);
    localStorage.setItem('formActivities', JSON.stringify(updatedActivities));
  };

  const addForm = (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt' | 'responsesCount' | 'lastResponseAt'>) => {
    const newForm: Form = {
      ...form,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responsesCount: 0,
    };
    setForms([...forms, newForm]);
    logActivity({
      type: 'form_created',
      formId: newForm.id,
      formTitle: newForm.title,
      userId: 'current-user', // En una app real, esto vendría de la autenticación
      userName: 'Usuario Actual',
      details: { status: newForm.status, type: newForm.type }
    });
  };

  const updateForm = (id: string, updates: Partial<Form>) => {
    const oldForm = forms.find(f => f.id === id);
    setForms(
      forms.map((form) =>
        form.id === id ? { ...form, ...updates, updatedAt: new Date().toISOString() } : form
      )
    );
    
    if (oldForm) {
      const updatedForm = { ...oldForm, ...updates };
      logActivity({
        type: 'form_updated',
        formId: id,
        formTitle: updatedForm.title,
        userId: 'current-user',
        userName: 'Usuario Actual',
        details: {
          changes: Object.keys(updates).reduce((acc, key) => {
            if (JSON.stringify(oldForm[key as keyof Form]) !== JSON.stringify(updates[key as keyof Form])) {
              acc[key] = { from: oldForm[key as keyof Form], to: updates[key as keyof Form] };
            }
            return acc;
          }, {} as Record<string, { from: any, to: any }>)
        }
      });
    }
  };

  const deleteForm = (id: string) => {
    const formToDelete = forms.find(form => form.id === id);
    if (formToDelete) {
      logActivity({
        type: 'form_deleted',
        formId: id,
        formTitle: formToDelete.title,
        userId: 'current-user',
        userName: 'Usuario Actual'
      });
    }
    setForms(forms.filter((form) => form.id !== id));
  };

  const getFormById = (id: string) => {
    return forms.find((form) => form.id === id);
  };

  const getRecentActivities = (limit: number = 5) => {
    return activities.slice(0, limit);
  };

  const exportFormData = (formId: string, format: 'csv' | 'json' | 'pdf') => {
    const form = getFormById(formId);
    if (!form) return;

    const data = {
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        status: form.status,
        type: form.type,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        responsesCount: form.responsesCount
      },
      fields: form.fields,
      activities: activities.filter(a => a.formId === formId)
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, `form-${form.title.toLowerCase().replace(/\s+/g, '-')}.json`);
    } else if (format === 'csv') {
      // Implementar lógica para CSV
      const csvRows = [];
      const headers = ['ID', 'Título', 'Estado', 'Tipo', 'Creado', 'Actualizado', 'Respuestas'];
      csvRows.push(headers.join(','));
      
      const values = [
        form.id,
        `"${form.title}"`,
        form.status,
        form.type,
        new Date(form.createdAt).toLocaleDateString(),
        new Date(form.updatedAt).toLocaleDateString(),
        form.responsesCount
      ];
      csvRows.push(values.join(','));
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `form-${form.title.toLowerCase().replace(/\s+/g, '-')}.csv`);
    } else if (format === 'pdf') {
      // Implementar lógica para PDF
      console.log('PDF export not yet implemented', data);
    }
  };

  const exportAllForms = (format: 'csv' | 'json' | 'xlsx') => {
    const data = forms.map(form => ({
      id: form.id,
      title: form.title,
      description: form.description,
      status: form.status,
      type: form.type,
      tags: form.tags.join(', '),
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      responsesCount: form.responsesCount || 0
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, `all-forms-${new Date().toISOString().split('T')[0]}.json`);
    } else if (format === 'csv') {
      const headers = Object.keys(data[0] || {});
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(field => 
            `"${String(row[field as keyof typeof row] || '').replace(/"/g, '""')}"`
          ).join(',')
        )
      ];
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `all-forms-${new Date().toISOString().split('T')[0]}.csv`);
    } else if (format === 'xlsx') {
      // Implementar lógica para XLSX
      console.log('XLSX export not yet implemented', data);
    }
  };

  useEffect(() => {
    try {
      const nonDefaultFilters = savedFilters.filter(f => !f.isDefault);
      localStorage.setItem('savedFilters', JSON.stringify(nonDefaultFilters));
    } catch (e) {
      console.error('Error saving filters', e);
    }
  }, [savedFilters]);

  const addSavedFilter = (filter: Omit<SavedFilter, 'id'>) => {
    const newFilter = {
      ...filter,
      id: `filter-${Date.now()}`,
    };
    setSavedFilters(prev => [...prev, newFilter]);
    return newFilter.id;
  };

  const updateSavedFilter = (id: string, updates: Partial<SavedFilter>) => {
    setSavedFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const deleteSavedFilter = (id: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== id));
  };

  const getSavedFilterById = (id: string) => {
    return savedFilters.find(filter => filter.id === id);
  };

  const value = {
    forms,
    currentForm,
    activities,
    addForm,
    updateForm,
    deleteForm,
    getFormById,
    getRecentActivities,
    exportFormData,
    exportAllForms,
    setCurrentForm,
    savedFilters,
    addSavedFilter,
    updateSavedFilter,
    deleteSavedFilter,
    getSavedFilterById,
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

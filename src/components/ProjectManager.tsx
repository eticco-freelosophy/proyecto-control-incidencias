"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, RefreshCw, RotateCcw, X, Loader2, Plus, Save, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Tipos de datos
type ProjectType = 'ODO' | 'ALF' | 'EJF' | 'BYT' | 'ETI';

interface Project {
  id: string;
  project_id: string;
  type: ProjectType;
  name: string;
  checked: boolean;
  created_at?: string;
  updated_at?: string;
}

const PROJECT_TYPES: (ProjectType | 'all')[] = ['all', 'ODO', 'ALF', 'EJF', 'BYT', 'ETI'];

const ProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProjectType | 'all'>('all');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    project_id: '',
    type: 'ETI' as ProjectType,
    name: ''
  });

  // Cargar proyectos desde Supabase
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('project_id');

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Error al cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar último log de actualización
  const loadLastUpdate = async () => {
    try {
      const { data, error } = await supabase
        .from('update_logs')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setLastUpdate(new Date(data[0].updated_at));
      }
    } catch (err) {
      console.error('Error loading last update:', err);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadProjects();
    loadLastUpdate();
  }, []);

  // Filtrado de proyectos
  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    // Filtro por tipo
    if (activeFilter !== 'all') {
      filtered = filtered.filter(project => project.type === activeFilter);
    }
    
    // Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.project_id.toLowerCase().includes(search) ||
        project.name.toLowerCase().includes(search) ||
        project.type.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [projects, activeFilter, searchTerm]);

  // Función para alternar el estado de un proyecto
  const toggleProject = async (projectId: string) => {
    try {
      // Encontrar el proyecto actual
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const newCheckedState = !project.checked;

      // Actualizar en Supabase
      const { error } = await supabase
        .from('projects')
        .update({ checked: newCheckedState })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      // Actualizar estado local
      setProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, checked: newCheckedState }
            : p
        )
      );
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Error al actualizar el proyecto');
    }
  };

  // Función para actualizar fecha
  const updateLastUpdate = async () => {
    try {
      const { error } = await supabase
        .from('update_logs')
        .insert([{ description: 'Actualización manual' }]);

      if (error) {
        throw error;
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error updating last update:', err);
      setError('Error al actualizar la fecha');
    }
  };

  // Función para resetear fecha
  const resetLastUpdate = async () => {
    try {
      const { error } = await supabase
        .from('update_logs')
        .delete()
        .neq('id', 0); // Eliminar todos los registros

      if (error) {
        throw error;
      }

      setLastUpdate(null);
    } catch (err) {
      console.error('Error resetting last update:', err);
      setError('Error al resetear la fecha');
    }
  };

  // Función para resetear todas las marcas
  const resetAllChecks = async () => {
    if (!confirm('¿Estás seguro de que quieres resetear todas las marcas?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Versión mejorada: usar un filtro más específico
      const { error } = await supabase
        .from('projects')
        .update({ checked: false })
        .not('id', 'is', null); // Actualizar todos los registros que tengan id (todos)

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Actualizar estado local
      setProjects(prev => 
        prev.map(project => ({ ...project, checked: false }))
      );

      console.log('Marcas reseteadas exitosamente');

    } catch (err) {
      console.error('Error resetting all checks:', err);
      setError(`Error al resetear las marcas: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para añadir un nuevo proyecto
  const addNewProject = async () => {
    try {
      // Validaciones
      if (!newProject.project_id.trim()) {
        setError('El ID del proyecto es obligatorio');
        return;
      }
      if (!newProject.name.trim()) {
        setError('El nombre del proyecto es obligatorio');
        return;
      }

      // Verificar que el ID no existe ya
      const existingProject = projects.find(p => p.project_id === newProject.project_id);
      if (existingProject) {
        setError('Ya existe un proyecto con ese ID');
        return;
      }

      setLoading(true);
      setError(null);

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          project_id: newProject.project_id,
          type: newProject.type,
          name: newProject.name,
          checked: false
        }])
        .select();

      if (error) {
        throw error;
      }

      // Actualizar estado local
      if (data && data.length > 0) {
        setProjects(prev => [...prev, data[0]]);
      }

      // Resetear formulario
      setNewProject({
        project_id: '',
        type: 'ETI',
        name: ''
      });
      setShowAddForm(false);

    } catch (err) {
      console.error('Error adding project:', err);
      setError('Error al añadir el proyecto');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar el formulario
  const cancelAddProject = () => {
    setNewProject({
      project_id: '',
      type: 'ETI',
      name: ''
    });
    setShowAddForm(false);
    setError(null);
  };

  // Función para iniciar la edición de un proyecto
  const startEditing = (project: Project) => {
    setEditingProject({ ...project });
    setError(null);
  };

  // Función para guardar los cambios de edición
  const saveEdit = async () => {
    if (!editingProject) return;

    try {
      // Validaciones
      if (!editingProject.project_id.trim()) {
        setError('El ID del proyecto es obligatorio');
        return;
      }
      if (!editingProject.name.trim()) {
        setError('El nombre del proyecto es obligatorio');
        return;
      }

      // Verificar que el ID no existe ya (excepto el actual)
      const existingProject = projects.find(p => 
        p.project_id === editingProject.project_id && p.id !== editingProject.id
      );
      if (existingProject) {
        setError('Ya existe un proyecto con ese ID');
        return;
      }

      setLoading(true);
      setError(null);

      // Actualizar en Supabase
      const { error } = await supabase
        .from('projects')
        .update({
          project_id: editingProject.project_id,
          type: editingProject.type,
          name: editingProject.name
        })
        .eq('id', editingProject.id);

      if (error) {
        throw error;
      }

      // Actualizar estado local
      setProjects(prev =>
        prev.map(p => p.id === editingProject.id ? editingProject : p)
      );

      setEditingProject(null);

    } catch (err) {
      console.error('Error updating project:', err);
      setError('Error al actualizar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar la edición
  const cancelEdit = () => {
    setEditingProject(null);
    setError(null);
  };

  // Función para eliminar un proyecto
  const deleteProject = async (project: Project) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar el proyecto "${project.name}" (${project.project_id})?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Eliminar de Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) {
        throw error;
      }

      // Actualizar estado local
      setProjects(prev => prev.filter(p => p.id !== project.id));

    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Error al eliminar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-slate-700 text-center mb-6">
          Lista de Proyectos - Santi
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-6">
          <div className="font-semibold">
            Última actualización: {lastUpdate ? formatDate(lastUpdate) : 'No hay actualización reciente'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              disabled={loading}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              Nuevo Proyecto
            </button>
            <button
              onClick={updateLastUpdate}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Actualizar fecha
            </button>
            <button
              onClick={resetLastUpdate}
              disabled={loading}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <X size={16} />
              Resetear fecha
            </button>
            <button
              onClick={resetAllChecks}
              disabled={loading}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Resetear marcas
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Añadir Nuevo Proyecto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Proyecto
                </label>
                <input
                  type="text"
                  value={newProject.project_id}
                  onChange={(e) => setNewProject(prev => ({ ...prev, project_id: e.target.value }))}
                  placeholder="ej: 0270"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value as ProjectType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ODO">ODO</option>
                  <option value="ALF">ALF</option>
                  <option value="EJF">EJF</option>
                  <option value="BYT">BYT</option>
                  <option value="ETI">ETI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ej: MI NUEVO PROYECTO"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addNewProject}
                disabled={loading}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                Guardar Proyecto
              </button>
              <button
                onClick={cancelAddProject}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {editingProject && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Editar Proyecto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Proyecto
                </label>
                <input
                  type="text"
                  value={editingProject.project_id}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, project_id: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={editingProject.type}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, type: e.target.value as ProjectType } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="ODO">ODO</option>
                  <option value="ALF">ALF</option>
                  <option value="EJF">EJF</option>
                  <option value="BYT">BYT</option>
                  <option value="ETI">ETI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveEdit}
                disabled={loading}
                className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                Guardar Cambios
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {PROJECT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'Todos' : type}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {filteredProjects.length} proyectos encontrados
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>Cargando proyectos...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                onClick={() => toggleProject(project.id)}
                className={`border-2 rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                  project.checked
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      project.checked ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="font-semibold text-blue-600">PROY {project.project_id}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {project.type}
                  </span>
                  
                  <div className="ml-auto flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(project);
                      }}
                      className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                      title="Editar proyecto"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project);
                      }}
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      title="Eliminar proyecto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="font-medium text-gray-800">
                  {project.name}
                </div>
                
                {project.updated_at && (
                  <div className="text-xs text-gray-500 mt-2">
                    Actualizado: {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
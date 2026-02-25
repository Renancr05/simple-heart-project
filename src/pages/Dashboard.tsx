import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Search, LogOut, Pencil, Trash2, Users, Building2, Phone, Mail } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  const fetchContacts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar contatos");
    } else {
      setContacts(data ?? []);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false) ||
      (c.company?.toLowerCase().includes(q) ?? false) ||
      (c.phone?.includes(q) ?? false)
    );
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("contacts").delete().eq("id", deleteId);
    if (error) {
      toast.error("Erro ao excluir contato");
    } else {
      toast.success("Contato excluído");
      fetchContacts();
    }
    setDeleteId(null);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditingContact(null);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold">Cadastro de Contatos</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contacts.length}</p>
                <p className="text-sm text-muted-foreground">Total de contatos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(contacts.filter((c) => c.company).map((c) => c.company)).size}
                </p>
                <p className="text-sm text-muted-foreground">Empresas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {contacts.filter((c) => c.email).length}
                </p>
                <p className="text-sm text-muted-foreground">Com email</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo contato
          </Button>
        </div>

        {/* Contact list */}
        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">
              {search ? "Nenhum contato encontrado" : "Nenhum contato cadastrado"}
            </p>
            <p className="text-sm mt-1">
              {search ? "Tente outra busca" : "Clique em \"Novo contato\" para começar"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((contact) => (
              <Card key={contact.id} className="animate-fade-in hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{contact.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {contact.email}
                          </span>
                        )}
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {contact.phone}
                          </span>
                        )}
                        {contact.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {contact.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Form dialog */}
      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={
          editingContact
            ? {
                id: editingContact.id,
                name: editingContact.name,
                email: editingContact.email ?? "",
                phone: editingContact.phone ?? "",
                company: editingContact.company ?? "",
                notes: editingContact.notes ?? "",
              }
            : null
        }
        onSaved={fetchContacts}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O contato será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

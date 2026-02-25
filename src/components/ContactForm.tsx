import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSaved: () => void;
}

export default function ContactForm({ open, onOpenChange, contact, onSaved }: ContactFormProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<Contact>(
    contact ?? { name: "", email: "", phone: "", company: "", notes: "" }
  );
  const [saving, setSaving] = useState(false);

  const isEditing = !!contact?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setSaving(true);

    if (isEditing) {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          notes: form.notes.trim() || null,
        })
        .eq("id", contact!.id!);

      if (error) {
        toast.error("Erro ao atualizar contato");
      } else {
        toast.success("Contato atualizado!");
        onSaved();
        onOpenChange(false);
      }
    } else {
      const { error } = await supabase.from("contacts").insert({
        user_id: user.id,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        notes: form.notes.trim() || null,
      });

      if (error) {
        toast.error("Erro ao criar contato");
      } else {
        toast.success("Contato criado!");
        onSaved();
        onOpenChange(false);
      }
    }
    setSaving(false);
  };

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setForm(contact ?? { name: "", email: "", phone: "", company: "", notes: "" });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar contato" : "Novo contato"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome do contato"
              required
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                maxLength={20}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Nome da empresa"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anotações sobre o contato..."
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

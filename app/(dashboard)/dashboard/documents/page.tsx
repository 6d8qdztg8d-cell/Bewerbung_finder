import { auth } from "@/lib/auth";
import { documentService } from "@/services/documents/document.service";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUpload } from "@/components/documents/document-upload";

export default async function DocumentsPage() {
  const session = await auth();
  const documents = await documentService.listByUser(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dokumente</h1>
        <p className="text-slate-400 mt-1">
          Lade deinen Lebenslauf und weitere Bewerbungsunterlagen hoch.
        </p>
      </div>

      <DocumentUpload />
      <DocumentList documents={documents} />
    </div>
  );
}

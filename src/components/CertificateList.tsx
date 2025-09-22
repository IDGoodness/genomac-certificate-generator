import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription,} from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
// import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Copy, Trash2, RefreshCw, Plus } from "lucide-react";
import {
  certificateService,
  type Certificate,
} from "../services/certificate.service";
import { generateSecureCertificateUrl } from "../utils/certificateUtils";

interface CertificateListProps {
  subsidiaryId: string;
  onCreateNew?: () => void;
}

const CertificateList: React.FC<CertificateListProps> = ({
  subsidiaryId,
  onCreateNew,
}) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Fetch certificates
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await certificateService.getCertificatesBySubsidiary(
        subsidiaryId
      );
      setCertificates(data);
    } catch (err) {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
    // eslint-disable-next-line
  }, [subsidiaryId]);

  // Copy link
  const handleCopy = async (cert: Certificate) => {
    try {
      const url = generateSecureCertificateUrl(
        cert.subsidiary || "",
        cert.courseTitle || "",
        cert._id || ""
      );
      await navigator.clipboard.writeText(url);
      // alert("Link copied to clipboard!");
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Delete single
  const handleDelete = async (cert: Certificate) => {
    if (!window.confirm("Delete this certificate?")) return;
    try {
      await certificateService.deleteCertificate(cert._id);
      toast.success("Deleted");
      fetchCertificates();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} certificates?`)) return;
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          certificateService.deleteCertificate(id)
        )
      );
      toast.success("Bulk delete complete");
      setSelected(new Set());
      fetchCertificates();
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  // UI helpers
  const isSelected = (id: string) => selected.has(id);
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(filtered.map((c) => c._id)));
  const clearAll = () => setSelected(new Set());

  // Filtered list
  const filtered = certificates.filter(
    (c) =>
      c.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      c.header?.toLowerCase().includes(search.toLowerCase()) ||
      c.courseTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button
            onClick={fetchCertificates}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {onCreateNew && (
            <Button onClick={onCreateNew} size="sm">
              <Plus className="w-4 h-4 mr-2" /> New Certificate
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={selected.size > 0 ? "destructive" : "outline"}
            size="sm"
            onClick={handleBulkDelete}
            disabled={selected.size === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete Selected ({selected.size}
            )
          </Button>
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No certificates found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cert) => (
            <Card key={cert._id} className="relative group">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{cert.header}</CardTitle>
                  <CardDescription>{cert.courseTitle}</CardDescription>
                </div>
                <Checkbox
                  checked={isSelected(cert._id)}
                  onCheckedChange={() => toggleSelect(cert._id)}
                />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{cert.studentName}</span>
                    <span>•</span>
                    <span>{new Date(cert.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(cert)}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy Link
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(cert)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateList;

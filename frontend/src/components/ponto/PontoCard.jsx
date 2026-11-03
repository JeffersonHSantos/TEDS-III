import { useEffect, useMemo, useState } from 'react';
import { Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { marcarPonto, pontoHoje } from '@/services/ponto';
import { apiMessage, formatTime } from '@/lib/format';

const SEQUENCIA = [
  { tipo: 'ENTRADA', label: 'Entrada', campo: 'entrada' },
  { tipo: 'SAIDA_ALMOCO', label: 'Saída almoço', campo: 'saidaAlmoco' },
  { tipo: 'RETORNO_ALMOCO', label: 'Retorno almoço', campo: 'retornoAlmoco' },
  { tipo: 'SAIDA', label: 'Saída', campo: 'saida' },
];

export default function PontoCard() {
  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState(null);

  async function carregar() {
    try {
      setLoading(true);
      const data = await pontoHoje();
      setRegistro(data);
    } catch (err) {
      toast.error(apiMessage(err, 'Não foi possível carregar o ponto de hoje.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(carregar);
  }, []);

  const proximo = useMemo(() => {
    return SEQUENCIA.find((item) => !registro?.[item.campo]) ?? null;
  }, [registro]);

  async function handleMarcar(tipo) {
    try {
      setMarcando(tipo);
      const data = await marcarPonto(tipo);
      setRegistro(data);
      toast.success('Ponto registrado.');
    } catch (err) {
      toast.error(apiMessage(err, 'Não foi possível marcar o ponto.'));
    } finally {
      setMarcando(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          Ponto de hoje
        </CardTitle>
        <CardDescription>
          Marque na ordem: entrada, saída para almoço, retorno e saída.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando registro...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {SEQUENCIA.map((item) => (
              <div key={item.tipo} className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-mono text-sm font-medium">
                  {formatTime(registro?.[item.campo])}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {proximo ? (
            <Button
              onClick={() => handleMarcar(proximo.tipo)}
              disabled={Boolean(marcando)}
            >
              {marcando ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Clock data-icon="inline-start" />}
              Marcar {proximo.label.toLowerCase()}
            </Button>
          ) : (
            <Badge>Jornada do dia concluída</Badge>
          )}
          <Button variant="outline" onClick={carregar} disabled={loading}>
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

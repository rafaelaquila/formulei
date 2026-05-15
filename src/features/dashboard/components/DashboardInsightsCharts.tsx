import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { DashboardInsight } from '@/shared/types/audit'

const CHART_PALETTE = [
  'hsl(222, 47%, 11%)',
  'hsl(215, 16%, 35%)',
  'hsl(215, 14%, 45%)',
  'hsl(215, 12%, 55%)',
  'hsl(215, 10%, 65%)',
  'hsl(215, 8%, 75%)',
]

const systemsChartConfig = {
  total: {
    label: 'Cadastros',
    color: 'hsl(222, 47%, 11%)',
  },
} satisfies ChartConfig

const sectorChartConfig = {
  total: {
    label: 'Formulários',
    color: 'hsl(215, 16%, 35%)',
  },
} satisfies ChartConfig

function slugChartKey(label: string, index: number) {
  const base = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return base ? `${base}_${index}` : `item_${index}`
}

interface Props {
  insights: DashboardInsight
}

export function DashboardInsightsCharts({ insights }: Props) {
  const { pieData, pieChartConfig } = useMemo(() => {
    const data = insights.tiposAcessoComuns.map((item, index) => {
      const key = slugChartKey(item.tipo, index)
      return {
        tipo: item.tipo,
        total: item.total,
        fill: `var(--color-${key})`,
        chartKey: key,
      }
    })

    const config: ChartConfig = {
      total: { label: 'Ocorrências' },
    }
    data.forEach((item, index) => {
      config[item.chartKey] = {
        label: item.tipo,
        color: CHART_PALETTE[index % CHART_PALETTE.length],
      }
    })

    return { pieData: data, pieChartConfig: config }
  }, [insights.tiposAcessoComuns])

  return (
    <>
      <div className="chart-grid">
        <Card>
          <CardHeader>
            <CardTitle>Sistemas mais utilizados</CardTitle>
            <CardDescription>Volume de cadastros por sistema</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {insights.sistemasMaisUtilizados.length === 0 ? (
              <p className="text-sm text-slate-500">Sem dados para exibir.</p>
            ) : (
              <ChartContainer config={systemsChartConfig} className="h-[280px] w-full">
                <BarChart
                  accessibilityLayer
                  data={insights.sistemasMaisUtilizados}
                  margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="sistema"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={72}
                    fontSize={11}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={36}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de acesso mais comuns</CardTitle>
            <CardDescription>Distribuição por tipo de permissão</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {pieData.length === 0 ? (
              <p className="text-sm text-slate-500">Sem dados para exibir.</p>
            ) : (
              <ChartContainer
                config={pieChartConfig}
                className="mx-auto aspect-square max-h-[280px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="tipo" />} />
                  <Pie
                    data={pieData}
                    dataKey="total"
                    nameKey="tipo"
                    innerRadius={56}
                    outerRadius={96}
                    paddingAngle={3}
                    strokeWidth={2}
                    stroke="hsl(210, 40%, 98%)"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.chartKey} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="total"
                      className="fill-slate-700"
                      stroke="none"
                      fontSize={11}
                      formatter={(value) =>
                        typeof value === 'number'
                          ? value.toLocaleString('pt-BR')
                          : String(value ?? '')
                      }
                    />
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="tipo" />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acessos por setor</CardTitle>
          <CardDescription>Formulários enviados por setor</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          {insights.acessosPorSetor.length === 0 ? (
            <p className="text-sm text-slate-500">Sem dados para exibir.</p>
          ) : (
            <ChartContainer config={sectorChartConfig} className="h-[300px] w-full">
              <BarChart
                accessibilityLayer
                data={insights.acessosPorSetor}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="setor"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={120}
                  fontSize={11}
                />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[0, 6, 6, 0]} maxBarSize={28} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </>
  )
}

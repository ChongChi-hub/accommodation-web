'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Tabs,
  Dialog,
  Drawer,
} from '@/presentation/components/ui';
import { ThemeToggle } from '@/presentation/components/layout/ThemeToggle';
import { CheckCircle, AlertCircle, Info, Send, Search } from 'lucide-react';

export default function UiKitShowcasePage() {
  const t = useTranslations('uiKit');
  const tCommon = useTranslations('common');
  const [activeTab, setActiveTab] = useState('tab1');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-foreground-muted mt-1">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('buttons')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md" leftIcon={<Send className="w-4 h-4" />}>
                {t('primary')}
              </Button>
              <Button variant="secondary" size="md">
                {t('secondary')}
              </Button>
              <Button variant="outline" size="md">
                {t('outline')}
              </Button>
              <Button variant="ghost" size="md">
                {t('ghost')}
              </Button>
              <Button variant="danger" size="md">
                {t('danger')}
              </Button>
              <Button variant="primary" size="md" isLoading>
                {t('primary')}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="sm">
                {tCommon('save')}
              </Button>
              <Button variant="primary" size="md">
                {tCommon('save')}
              </Button>
              <Button variant="primary" size="lg">
                {tCommon('save')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('inputs')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('inputLabel')}
              placeholder={t('sampleInput')}
              helperText={t('inputHelper')}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Input
              label={t('inputLabel')}
              placeholder={t('sampleInput')}
              error={t('inputHelper')}
              defaultValue="Invalid input test"
            />
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('badges')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2.5">
            <Badge variant="primary">
              <CheckCircle className="w-3 h-3" />
              <span>{t('primary')}</span>
            </Badge>
            <Badge variant="secondary">
              <span>{t('secondary')}</span>
            </Badge>
            <Badge variant="success">
              <CheckCircle className="w-3 h-3" />
              <span>{tCommon('statusApproved')}</span>
            </Badge>
            <Badge variant="warning">
              <AlertCircle className="w-3 h-3" />
              <span>{tCommon('statusPending')}</span>
            </Badge>
            <Badge variant="danger">
              <AlertCircle className="w-3 h-3" />
              <span>{tCommon('statusRejected')}</span>
            </Badge>
            <Badge variant="info">
              <Info className="w-3 h-3" />
              <span>{tCommon('details')}</span>
            </Badge>
            <Badge variant="neutral">
              <span>{tCommon('filter')}</span>
            </Badge>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tabs')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              activeId={activeTab}
              onChange={setActiveTab}
              items={[
                { id: 'tab1', label: t('primary'), badge: 5 },
                { id: 'tab2', label: t('secondary'), badge: 12 },
                { id: 'tab3', label: t('outline') },
              ]}
            />
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tables')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t('inputLabel')}</TableHead>
                  <TableHead>{tCommon('status')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">01</TableCell>
                  <TableCell>Phòng studio ban công Phường Bến Nghé, đầy đủ tiện nghi</TableCell>
                  <TableCell>
                    <Badge variant="success">{tCommon('statusApproved')}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      {tCommon('details')}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">02</TableCell>
                  <TableCell>Căn hộ dịch vụ Phường 15, giờ giấc tự do</TableCell>
                  <TableCell>
                    <Badge variant="warning">{tCommon('statusPending')}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      {tCommon('details')}
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modals & Drawers Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dialogs')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
              {t('openDialog')}
            </Button>
            <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
              {t('openDrawer')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Preview */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={t('openDialog')}
        description={t('subtitle')}
      >
        <div className="space-y-4">
          <p className="text-xs text-foreground-muted">{t('inputHelper')}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(false)}>
              {tCommon('confirm')}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Drawer Preview */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={t('openDrawer')}
      >
        <div className="space-y-4">
          <p className="text-xs text-foreground-muted">{t('inputHelper')}</p>
          <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>
            {tCommon('close')}
          </Button>
        </div>
      </Drawer>
    </div>
  );
}


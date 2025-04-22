import './GraphModal.scss';

import type { CursorAction } from '@components/CursorTrackingArea';
import { Button, TextField, Theme } from '@radix-ui/themes';
import { IconDownload, IconSend, IconX } from '@tabler/icons-react';
import ReactECharts from 'echarts-for-react';
import { FunctionComponent,useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

// Interface pour définir les propriétés du composant GraphModal
interface GraphModalProps {
  open?: boolean; // Indique si la modale est ouverte ou non
  onClose?: () => void; // Callback pour fermer la modale
  data?: { time: number; x: number; y: number; action: CursorAction }[]; // Données utilisées pour le graphique
  onDownloadButtonClick?: () => void; // Callback pour le bouton de téléchargement
  onSendByEmailButtonClick?: (data: string[]) => void; // Callback pour envoyer les données par email
  loading?: boolean; // Indique si une action est en cours de chargement
  onChangeEmail?: (email: string) => void; // Callback pour gérer les changements de l'email
  email?: string; // Email saisi dans le champ de texte
}

// Composant principal GraphModal
export const GraphModal: FunctionComponent<GraphModalProps> = ({
  open = false, // Par défaut, la modale est fermée
  onClose,
  data = [], // Par défaut, aucune donnée n'est présente
  onDownloadButtonClick,
  onSendByEmailButtonClick,
  loading = false,
  onChangeEmail,
  email = '',
}) => {
  // État pour valider l'email saisi
  const [isValidEmail, setIsValidEmail] = useState(true);

  // Utilisation de useMemo pour optimiser le calcul des catégories d'événements
  const events = useMemo(() => {
    const categories = {
      drag: [] as [number, number][], // Événements de type "drag"
      click: [] as [number, number][], // Événements de type "clic gauche"
      doubleClick: [] as [number, number][], // Événements de type "double clic"
      rightClick: [] as [number, number][], // Événements de type "clic droit"
      all: [] as [number, number][], // Tous les événements combinés
    };

    // Parcours des données pour classer les événements par type
    data.forEach(({ x, y, action }) => {
      const point = [x, -y] as [number, number];
      categories.all.push(point); // Ajouter chaque point à "all"
      if (action === 'drag') categories.drag.push(point);
      if (action === 'left_click') categories.click.push(point);
      if (action === 'double_click') categories.doubleClick.push(point);
      if (action === 'right_click') categories.rightClick.push(point);
    });

    return categories;
  }, [data]);

  // Si la modale n'est pas ouverte, ne rien rendre
  if (!open) return null;

  // Fonction pour valider la structure d'un email
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Fonction pour gérer les changements d'email et mettre à jour la validation
  const handleChangeEmail = (email: string) => {
    setIsValidEmail(email === '' || validateEmail(email));
    onChangeEmail?.(email);
  };

  // Récupération de l'élément DOM pour le portail
  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) {
    console.error('Element with id "portal-root" not found in the DOM.');
    return null;
  }

  // Configuration des séries du graphique
  const chartSeries = [
    {
      name: 'Drag',
      type: 'scatter',
      symbol: 'square',
      symbolSize: 8,
      data: events.drag,
      itemStyle: { color: '#79eb71' },
    },
    {
      type: 'line',
      symbolSize: 0,
      data: events.all,
      itemStyle: { color: '#FFFFFF80' },
    },
    {
      name: 'Clic gauche',
      type: 'effectScatter',
      symbolSize: 12,
      data: events.click,
      itemStyle: { color: '#eb7181' },
    },
    {
      name: 'Double clic',
      type: 'effectScatter',
      symbolSize: 12,
      data: events.doubleClick,
      itemStyle: { color: '#717feb' },
    },
    {
      name: 'Clic droit',
      type: 'effectScatter',
      symbolSize: 12,
      data: events.rightClick,
      itemStyle: { color: '#ebde71' },
    },
  ];

  // Rendu du composant dans le DOM grâce à React Portal
  return createPortal(
    <Theme>
      <div className="Overlay">
        <div className="GraphModal">
          {/* En-tête de la modale */}
          <div className="GraphModal__header">
            <div className="GraphModal__header__left--area">
              {/* Bouton pour envoyer les données par email */}
              <Button
                className="GraphModal__header__left__send__email--button"
                disabled={!isValidEmail}
                onClick={() =>
                  data.length &&
                  onSendByEmailButtonClick?.([
                    'time,x,y,action',
                    ...data.map(
                      ({ time, x, y, action }) =>
                        `${time},${x},${y},${action}`
                    ),
                  ])
                }
                color="yellow"
                loading={loading}
              >
                <IconSend size={18} />
                Envoyer le CSV par email
              </Button>
              {/* Champ pour saisir l'email */}
              <TextField.Root
                type="email"
                placeholder="Email"
                onChange={(e) => handleChangeEmail(e.target.value)}
                defaultValue={email}
              />
              {/* Bouton pour télécharger les données en local */}
              <Button
                color="gray"
                onClick={onDownloadButtonClick}
                variant="solid"
                highContrast
              >
                <IconDownload size={18} /> Télécharger le CSV en local
              </Button>
            </div>
            {/* Bouton pour fermer la modale */}
            <button
              aria-label="Close"
              type="button"
              className="GraphModal__close--button"
              onClick={onClose}
            >
              <IconX />
            </button>
          </div>
          {/* Corps de la modale avec le graphique */}
          <div className="GraphModal__body">
            <ReactECharts
              option={{
                xAxis: axisConfig,
                yAxis: { ...axisConfig, max: 0 },
                legend: legendConfig,
                series: chartSeries,
              }}
              style={{ width: '1400px', height: '700px' }}
            />
          </div>
        </div>
      </div>
    </Theme>,
    portalRoot
  );
};

// Configuration des axes pour le graphique
const axisConfig = {
  scale: true,
  axisLine: { show: true, lineStyle: { color: '#64676d', type: 'dashed' } },
  axisTick: { show: false },
  axisLabel: { show: false },
  splitLine: { show: true, lineStyle: { color: '#64676d', type: 'dashed' } },
};

// Configuration de la légende pour le graphique
const legendConfig = {
  data: ['Drag', 'Mouvement', 'Clic gauche', 'Double clic', 'Clic droit'],
  textStyle: { color: '#FFFFFF' },
  top: '10px',
};
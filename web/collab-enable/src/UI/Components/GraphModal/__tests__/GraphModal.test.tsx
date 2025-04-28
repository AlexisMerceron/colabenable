import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { GraphModal } from '../GraphModal';

describe('Composant GraphModal', () => {
  let portalRoot: HTMLElement;

  beforeAll(() => {
    // Créer un conteneur DOM pour le portail
    portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'portal-root');
    document.body.appendChild(portalRoot);
  });

  afterAll(() => {
    // Vérifier la présence de portalRoot avant de le supprimer
    const existingportalRoot = document.getElementById('portal-root');
    if (existingportalRoot) {
      document.body.removeChild(existingportalRoot);
    }
  });

  const mockData = [
    { time: 1, x: 10, y: 20, action: 'left_click' },
    { time: 2, x: 15, y: 25, action: 'double_click' },
  ];

  // Mock des fonctions pour la configuration du composant
  const onClose = vi.fn();
  const onDownloadButtonClick = vi.fn();
  const onSendByEmailButtonClick = vi.fn();
  const onChangeEmail = vi.fn();

  beforeEach(() => {
    if (!document.getElementById('portal-root')) {
      const portalRoot = document.createElement('div');
      portalRoot.setAttribute('id', 'portal-root');
      document.body.appendChild(portalRoot);
    }
    // Rendre le composant GraphModal avec les props nécessaires avant chaque test
    render(
      <GraphModal
        open={true}
        onClose={onClose}
        data={mockData}
        onDownloadButtonClick={onDownloadButtonClick}
        onSendByEmailButtonClick={onSendByEmailButtonClick}
        onChangeEmail={onChangeEmail}
        email="test@example.com"
      />,
      { container: portalRoot } // Spécifier que le composant doit être rendu dans portalRoot
    );
  });

  afterEach(() => {
    // Réinitialiser tous les mocks pour éviter les interférences entre les tests
    vi.clearAllMocks();
    const portalRoot = document.getElementById('portal-root');
    if (portalRoot) {
      document.body.removeChild(portalRoot);
    }
  });

  test('affiche la modale avec les données du graphique et les boutons', () => {
    // Vérifier la présence du texte dans la modale
    screen.getByText('Envoyer le CSV par email');
    screen.getByText('Télécharger le CSV en local');
  });

  test('ferme la modale lorsque le bouton de fermeture est cliqué', () => {
    // Simuler un clic sur le bouton de fermeture
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    // Vérifier que la fonction onClose a été appelée une fois
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onDownloadButtonClick lorsque le bouton de téléchargement est cliqué', () => {
    // Simuler un clic sur le bouton de téléchargement
    fireEvent.click(screen.getByText('Télécharger le CSV en local'));
    // Vérifier que la fonction onDownloadButtonClick a été appelée une fois
    expect(onDownloadButtonClick).toHaveBeenCalledTimes(1);
  });

  test('appelle onSendByEmailButtonClick avec un nouvel email valide lorsque le bouton d\'envoi par email est cliqué', () => {
    // Ajout d'un email valide pour activer le bouton
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'newemail@example.com' } });

    // Simuler un clic sur le bouton d'envoi par email
    const sendButton = screen.getByText('Envoyer le CSV par email');
    expect(sendButton).toBeInTheDocument(); // Vérifie que le bouton est dans le DOM
    expect(sendButton).not.toBeDisabled(); // Vérifie que le bouton n'est pas désactivé
    fireEvent.click(sendButton);

    // Vérifier que la fonction onSendByEmailButtonClick a été appelée avec les données correctes
    expect(onSendByEmailButtonClick).toHaveBeenCalledWith([
      'time,x,y,action',
      '1,10,20,left_click',
      '2,15,25,double_click',
    ]);
  });

  test('appelle onSendByEmailButtonClick avec un nouvel email non valide lorsque le bouton d\'envoi par email est cliqué', () => {
    // Ajout d'un email non valide pour activer le bouton
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'newemailexample.com' } });

    // Simuler un clic sur le bouton d'envoi par email
    const sendButton = screen.getByText('Envoyer le CSV par email');
    expect(sendButton).toBeInTheDocument(); // Vérifie que le bouton est dans le DOM
    fireEvent.click(sendButton);

    // Vérifier que la fonction onSendByEmailButtonClick a été appelée avec les données correctes
    expect(sendButton).toBeDisabled(); // Vérifie que le bouton est désactivé
  });

  test('appelle onSendByEmailButtonClick sans nouvel email lorsque le bouton d\'envoi par email est cliqué', () => {
    // Simuler un clic sur le bouton d'envoi par email
    const sendButton = screen.getByText('Envoyer le CSV par email');
    expect(sendButton).toBeInTheDocument(); // Vérifie que le bouton est dans le DOM
    expect(sendButton).not.toBeDisabled(); // Vérifie que le bouton n'est pas désactivé
    fireEvent.click(sendButton);

    // Vérifier que la fonction onSendByEmailButtonClick a été appelée avec les données correctes
    expect(onSendByEmailButtonClick).toHaveBeenCalledWith([
      'time,x,y,action',
      '1,10,20,left_click',
      '2,15,25,double_click',
    ]);
  });

  test('appelle onChangeEmail lorsque l\'entrée de l\'email est modifiée', () => {
    // Simuler la modification de l'email dans le champ de saisie
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'newemail@example.com' } });
    // Vérifier que la fonction onChangeEmail a été appelée avec le nouvel email
    expect(onChangeEmail).toHaveBeenCalledWith('newemail@example.com');
  });
});
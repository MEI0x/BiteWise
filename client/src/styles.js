export const styles = {
    appContainer: { maxWidth: '850px', margin: '40px auto', padding: '0 20px', fontFamily: 'inherit' },
    authWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' },
    authCard: { width: '100%', maxWidth: '400px', padding: '35px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    errorAlert: { padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.9em', marginBottom: '16px', fontWeight: '500' },
    authSubmitBtn: { padding: '12px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '1em', fontWeight: '600', cursor: 'pointer', marginTop: '5px' },
    switchLink: { color: '#0288d1', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' },
    header: { marginBottom: '35px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' },
    brandTitle: { fontSize: '2.4em', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
    brandSubtitle: { fontSize: '1em', color: '#64748b', margin: 0 },
    userGreeting: { marginRight: '15px', color: '#475569', fontSize: '0.95em' },
    logoutBtn: { padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', fontSize: '0.85em', fontWeight: '600', cursor: 'pointer' },
    tabContainer: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '10px' },
    tabButton: { padding: '10px 20px', fontSize: '0.95em', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    formCardGreen: { backgroundColor: '#f8fafc', borderLeft: '5px solid #2e7d32', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '30px', border: '1px solid #e2e8f0' },
    formCardBlue: { backgroundColor: '#f8fafc', borderLeft: '5px solid #0288d1', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '30px', border: '1px solid #e2e8f0' },
    formLayout: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    inputField: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.95em', flex: '2', transition: 'all 0.2s' },
    inputQty: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.95em', flex: '0.5', minWidth: '60px' },
    selectField: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.95em', cursor: 'pointer' },
    submitBtnGreen: { padding: '10px 20px', backgroundColor: '#2e7d32', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
    submitBtnBlue: { padding: '10px 20px', backgroundColor: '#0288d1', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
    sectionHeading: { fontSize: '1.4em', fontWeight: '700', color: '#1e293b', marginBottom: '15px' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
    dataRow: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    itemName: { fontSize: '1.05em', fontWeight: '600', color: '#0f172a' },
    itemBadge: { marginLeft: '12px', fontSize: '0.85em', padding: '3px 8px', backgroundColor: '#f1f5f9', borderRadius: '12px', color: '#475569', fontWeight: '500' },
    expiryTag: { marginLeft: '12px', fontSize: '0.85em', color: '#64748b' },
    actionBtnWarning: { backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600' },
    actionBtnDanger: { backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600' },
    checkbox: { width: '17px', height: '17px', cursor: 'pointer' },
    inlineRemoveBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.05em', padding: '4px' },
    infoText: { color: '#64748b', fontStyle: 'italic' },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.2s ease'
    },
    statLabel: {
      fontSize: '0.85em',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px'
    },
    statValue: {
      fontSize: '1.8em',
      fontWeight: '800',
      color: '#0f172a'
    },
    filterControlsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '20px'
    },
    searchBar: {
      padding: '10px 14px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1',
      fontSize: '0.95em',
      flex: '1',
      minWidth: '200px'
    },
    filterButtonGroup: {
      display: 'flex',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      backgroundColor: '#ffffff',
      padding: '2px',
      gap: '2px'
    },
    filterTabBtn: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.85em',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      color: '#475569',
      transition: 'all 0.15s ease'
    },
    inlineQtyInput: {
      width: '65px',
      padding: '4px 6px',
      borderRadius: '4px',
      border: '1px solid #cbd5e1',
      fontSize: '0.9em',
      textAlign: 'center',
      fontWeight: '600',
      color: '#0f172a',
      backgroundColor: '#f8fafc'
    },
    unitLabel: {
      fontSize: '0.85em',
      padding: '3px 6px',
      color: '#475569',
      fontWeight: '500'
    },
    categoryTitleHeader: {
      fontSize: '1.15em',
      fontWeight: '700',
      color: '#334155',
      backgroundColor: '#f1f5f9',
      padding: '8px 14px',
      borderRadius: '6px',
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    miniProductGraphic: {
      fontSize: '1.6em',
      padding: '6px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px'
    },
    subcategoryLabel: {
      fontSize: '0.75em',
      color: '#64748b',
      backgroundColor: '#f8fafc',
      padding: '2px 6px',
      borderRadius: '4px',
      marginLeft: '8px',
      border: '1px solid #e2e8f0'
    },
    categoryPillBtn: {
      padding: '6px 12px',
      borderRadius: '20px',
      border: '1px solid #cbd5e1',
      fontSize: '0.8em',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    },
    searchBar: {
      padding: '10px 14px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1',
      fontSize: '0.95em',
      width: '100%', // Makes search span the full width cleanly
      boxSizing: 'border-box'
    },
    formSelectInput: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1',
      fontSize: '0.95em',
      fontWeight: '500',
      color: '#0f172a',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      outline: 'none',
      boxSizing: 'border-box',
      appearance: 'none', // Removes default retro browser arrow profiling
      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', // Custom sleek dropdown arrow
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '16px',
      paddingRight: '40px', // Extra breathing room for the custom arrow icon
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      transition: 'border-color 0.15s ease'
    },
    addItemSubmitBtn: {
      width: '100%',
      padding: '10px 16px',
      backgroundColor: '#2e7d32', // Emerald green style signature
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.95em',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease'
    },
    formInput: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1',
      fontSize: '0.95em',
      fontWeight: '500',
      color: '#0f172a',
      backgroundColor: '#ffffff',
      outline: 'none',
      boxSizing: 'border-box',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      transition: 'all 0.15s ease',
      fontFamily: 'inherit' // Ensures native date typography matches your layout
    },
    autocompleteOverlayCard: {
      position: 'absolute',
      top: '64px',
      left: '0',
      right: '0',
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: '999', // Forces suggestions to display above all background card wrappers safely
      maxHeight: '260px',
      overflowY: 'auto'
    },
    suggestionRowItem: {
      padding: '10px 14px',
      fontSize: '0.9em',
      color: '#334155',
      cursor: 'pointer',
      transition: 'background-color 0.1s ease',
      borderBottom: '1px solid #f1f5f9',
      textAlign: 'left'
    },
    autocompleteOverlayCard: {
      position: 'absolute',
      top: '64px',
      left: '0',
      right: '0',
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: '999',
      maxHeight: '500px', // 💡 INCREASED HERE: Gives you room for roughly 12-14 items visible at a glance!
      overflowY: 'auto'
    },
  };
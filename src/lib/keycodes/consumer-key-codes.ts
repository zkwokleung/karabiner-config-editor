import type { KeyCodeCategory } from './types';

export const CONSUMER_KEY_CODE_CATEGORIES: KeyCodeCategory[] = [
  {
    category: 'Media controls',
    items: [
      { label: 'mute', consumer_key_code: 'mute' },
      { label: 'volume_decrement', consumer_key_code: 'volume_decrement' },
      { label: 'volume_increment', consumer_key_code: 'volume_increment' },
      { label: 'rewind', consumer_key_code: 'rewind' },
      { label: 'play_or_pause', consumer_key_code: 'play_or_pause' },
      { label: 'fastforward', consumer_key_code: 'fastforward' },
      { label: 'eject', consumer_key_code: 'eject' },
      {
        label: 'display_brightness_decrement',
        consumer_key_code: 'display_brightness_decrement',
      },
      {
        label: 'display_brightness_increment',
        consumer_key_code: 'display_brightness_increment',
      },
    ],
  },
  {
    category: 'Consumer keys',
    items: [
      { label: 'dictation', consumer_key_code: 'dictation' },
      { label: 'microphone', consumer_key_code: 'microphone' },
      { label: 'power (consumer)', consumer_key_code: 'power' },
      { label: 'menu (touch id)', consumer_key_code: 'menu' },
      { label: 'menu_pick', consumer_key_code: 'menu_pick' },
      { label: 'menu_up', consumer_key_code: 'menu_up' },
      { label: 'menu_down', consumer_key_code: 'menu_down' },
      { label: 'menu_left', consumer_key_code: 'menu_left' },
      { label: 'menu_right', consumer_key_code: 'menu_right' },
      { label: 'menu_escape', consumer_key_code: 'menu_escape' },
      {
        label: 'menu_value_increase',
        consumer_key_code: 'menu_value_increase',
      },
      {
        label: 'menu_value_decrease',
        consumer_key_code: 'menu_value_decrease',
      },
      { label: 'data_on_screen', consumer_key_code: 'data_on_screen' },
      { label: 'closed_caption', consumer_key_code: 'closed_caption' },
      {
        label: 'closed_caption_select',
        consumer_key_code: 'closed_caption_select',
      },
      { label: 'vcr_or_tv', consumer_key_code: 'vcr_or_tv' },
      { label: 'broadcast_mode', consumer_key_code: 'broadcast_mode' },
      { label: 'snapshot', consumer_key_code: 'snapshot' },
      { label: 'still', consumer_key_code: 'still' },
      {
        label: 'picture_in_picture_toggle',
        consumer_key_code: 'picture_in_picture_toggle',
      },
      {
        label: 'picture_in_picture_swap',
        consumer_key_code: 'picture_in_picture_swap',
      },
      { label: 'red_menu_button', consumer_key_code: 'red_menu_button' },
      { label: 'green_menu_button', consumer_key_code: 'green_menu_button' },
      { label: 'blue_menu_button', consumer_key_code: 'blue_menu_button' },
      {
        label: 'yellow_menu_button',
        consumer_key_code: 'yellow_menu_button',
      },
      { label: 'aspect', consumer_key_code: 'aspect' },
      {
        label: 'three_dimensional_mode_select',
        consumer_key_code: 'three_dimensional_mode_select',
      },
      { label: 'selection', consumer_key_code: 'selection' },
      { label: 'fast_forward', consumer_key_code: 'fast_forward' },
      { label: 'scan_next_track', consumer_key_code: 'scan_next_track' },
      {
        label: 'scan_previous_track',
        consumer_key_code: 'scan_previous_track',
      },
      { label: 'stop (consumer)', consumer_key_code: 'stop' },
      { label: 'voice_command', consumer_key_code: 'voice_command' },
      { label: 'bass_boost', consumer_key_code: 'bass_boost' },
      { label: 'loudness', consumer_key_code: 'loudness' },
      { label: 'bass_increment', consumer_key_code: 'bass_increment' },
      { label: 'bass_decrement', consumer_key_code: 'bass_decrement' },
      {
        label: 'al_consumer_control_configuration',
        consumer_key_code: 'al_consumer_control_configuration',
      },
      { label: 'al_word_processor', consumer_key_code: 'al_word_processor' },
      { label: 'al_text_editor', consumer_key_code: 'al_text_editor' },
      { label: 'al_spreadsheet', consumer_key_code: 'al_spreadsheet' },
      {
        label: 'al_graphics_editor',
        consumer_key_code: 'al_graphics_editor',
      },
      {
        label: 'al_presentation_app',
        consumer_key_code: 'al_presentation_app',
      },
      { label: 'al_database_app', consumer_key_code: 'al_database_app' },
      { label: 'al_email_reader', consumer_key_code: 'al_email_reader' },
      { label: 'al_newsreader', consumer_key_code: 'al_newsreader' },
      { label: 'al_voicemail', consumer_key_code: 'al_voicemail' },
      {
        label: 'al_contacts_or_address_book',
        consumer_key_code: 'al_contacts_or_address_book',
      },
      {
        label: 'al_Calendar_Or_Schedule',
        consumer_key_code: 'al_Calendar_Or_Schedule',
      },
      {
        label: 'al_task_or_project_manager',
        consumer_key_code: 'al_task_or_project_manager',
      },
      {
        label: 'al_log_or_journal_or_timecard',
        consumer_key_code: 'al_log_or_journal_or_timecard',
      },
      {
        label: 'al_checkbook_or_finance',
        consumer_key_code: 'al_checkbook_or_finance',
      },
      { label: 'al_calculator', consumer_key_code: 'al_calculator' },
      {
        label: 'al_a_or_v_capture_or_playback',
        consumer_key_code: 'al_a_or_v_capture_or_playback',
      },
      {
        label: 'al_local_machine_browser',
        consumer_key_code: 'al_local_machine_browser',
      },
      {
        label: 'al_lan_or_wan_browser',
        consumer_key_code: 'al_lan_or_wan_browser',
      },
      {
        label: 'al_internet_browser',
        consumer_key_code: 'al_internet_browser',
      },
      {
        label: 'al_remote_networking_or_isp_connect',
        consumer_key_code: 'al_remote_networking_or_isp_connect',
      },
      {
        label: 'al_network_conference',
        consumer_key_code: 'al_network_conference',
      },
      { label: 'al_network_chat', consumer_key_code: 'al_network_chat' },
      {
        label: 'al_telephony_or_dialer',
        consumer_key_code: 'al_telephony_or_dialer',
      },
      { label: 'al_logon', consumer_key_code: 'al_logon' },
      { label: 'al_logoff', consumer_key_code: 'al_logoff' },
      {
        label: 'al_logon_or_logoff',
        consumer_key_code: 'al_logon_or_logoff',
      },
      {
        label: 'al_terminal_lock_or_screensaver',
        consumer_key_code: 'al_terminal_lock_or_screensaver',
      },
      { label: 'al_control_panel', consumer_key_code: 'al_control_panel' },
      {
        label: 'al_command_line_processor_or_run',
        consumer_key_code: 'al_command_line_processor_or_run',
      },
      {
        label: 'al_process_or_task_manager',
        consumer_key_code: 'al_process_or_task_manager',
      },
      {
        label: 'al_select_task_or_application',
        consumer_key_code: 'al_select_task_or_application',
      },
      {
        label: 'al_next_task_or_application',
        consumer_key_code: 'al_next_task_or_application',
      },
      {
        label: 'al_previous_task_or_application',
        consumer_key_code: 'al_previous_task_or_application',
      },
      {
        label: 'al_preemptive_halt_task_or_application',
        consumer_key_code: 'al_preemptive_halt_task_or_application',
      },
      {
        label: 'al_integrated_help_center',
        consumer_key_code: 'al_integrated_help_center',
      },
      { label: 'al_documents', consumer_key_code: 'al_documents' },
      { label: 'al_thesaurus', consumer_key_code: 'al_thesaurus' },
      { label: 'al_dictionary', consumer_key_code: 'al_dictionary' },
      { label: 'al_desktop', consumer_key_code: 'al_desktop' },
      { label: 'al_spell_check', consumer_key_code: 'al_spell_check' },
      { label: 'al_grammer_check', consumer_key_code: 'al_grammer_check' },
      {
        label: 'al_wireless_status',
        consumer_key_code: 'al_wireless_status',
      },
      { label: 'al_keyboard_layout', consumer_key_code: 'al_keyboard_layout' },
      {
        label: 'al_virus_protection',
        consumer_key_code: 'al_virus_protection',
      },
      { label: 'al_encryption', consumer_key_code: 'al_encryption' },
      { label: 'al_screen_saver', consumer_key_code: 'al_screen_saver' },
      { label: 'al_alarms', consumer_key_code: 'al_alarms' },
      { label: 'al_clock', consumer_key_code: 'al_clock' },
      { label: 'al_file_browser', consumer_key_code: 'al_file_browser' },
      { label: 'al_power_status', consumer_key_code: 'al_power_status' },
      { label: 'al_image_browser', consumer_key_code: 'al_image_browser' },
      { label: 'al_audio_browser', consumer_key_code: 'al_audio_browser' },
      { label: 'al_movie_browser', consumer_key_code: 'al_movie_browser' },
      {
        label: 'al_digital_rights_manager',
        consumer_key_code: 'al_digital_rights_manager',
      },
      { label: 'al_digital_wallet', consumer_key_code: 'al_digital_wallet' },
      {
        label: 'al_instant_messaging',
        consumer_key_code: 'al_instant_messaging',
      },
      {
        label: 'al_oem_feature_browser',
        consumer_key_code: 'al_oem_feature_browser',
      },
      { label: 'al_oem_help', consumer_key_code: 'al_oem_help' },
      {
        label: 'al_online_community',
        consumer_key_code: 'al_online_community',
      },
      {
        label: 'al_entertainment_content_browser',
        consumer_key_code: 'al_entertainment_content_browser',
      },
      {
        label: 'al_online_shopping_browswer',
        consumer_key_code: 'al_online_shopping_browswer',
      },
      {
        label: 'al_smart_card_information_or_help',
        consumer_key_code: 'al_smart_card_information_or_help',
      },
      {
        label: 'al_market_monitor_or_finance_browser',
        consumer_key_code: 'al_market_monitor_or_finance_browser',
      },
      {
        label: 'al_customized_corporate_news_browser',
        consumer_key_code: 'al_customized_corporate_news_browser',
      },
      {
        label: 'al_online_activity_browswer',
        consumer_key_code: 'al_online_activity_browswer',
      },
      {
        label: 'al_research_or_search_browswer',
        consumer_key_code: 'al_research_or_search_browswer',
      },
      { label: 'al_audio_player', consumer_key_code: 'al_audio_player' },
      { label: 'al_message_status', consumer_key_code: 'al_message_status' },
      { label: 'al_contact_sync', consumer_key_code: 'al_contact_sync' },
      { label: 'al_navigation', consumer_key_code: 'al_navigation' },
      {
        label: 'al_contextaware_desktop_assistant',
        consumer_key_code: 'al_contextaware_desktop_assistant',
      },
      { label: 'ac_search', consumer_key_code: 'ac_search' },
      { label: 'ac_home', consumer_key_code: 'ac_home' },
      { label: 'ac_back', consumer_key_code: 'ac_back' },
      { label: 'ac_forward', consumer_key_code: 'ac_forward' },
      { label: 'ac_refresh', consumer_key_code: 'ac_refresh' },
      { label: 'ac_bookmarks', consumer_key_code: 'ac_bookmarks' },
      { label: 'ac_zoom_out', consumer_key_code: 'ac_zoom_out' },
      { label: 'ac_zoom_in', consumer_key_code: 'ac_zoom_in' },
    ],
  },
];

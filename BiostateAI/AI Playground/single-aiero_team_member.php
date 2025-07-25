<?php
/**
 * The template for displaying single team member item page
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package WordPress
 * @subpackage Aiero
 * @since Aiero 1.0
 */

the_post();
get_header();

$content_classes = $additional_classes = 'content-wrapper content-wrapper-sidebar-position-none';
$content_classes .= ( aiero_get_prefered_option('content_top_margin') == 'on' ? ' content-wrapper-remove-top-margin' : '' );

$content = apply_filters('the_content', get_the_content());
if ( empty($content) ) {
    $content_classes .= ( aiero_get_prefered_option('content_bottom_margin') == 'on' ? ' content-wrapper-remove-bottom-margin' : '' );
} else {
    $additional_classes .= ( aiero_get_prefered_option('content_bottom_margin') == 'on' ? ' content-wrapper-remove-bottom-margin' : '' );
};
?>
    <div id="team-<?php the_ID(); ?>" class="single-team">

        <section>
            <div class="<?php echo esc_attr($content_classes); ?>">

                <!-- Content Container -->
                <div class="content">
                    <div class="team-info-main">
                        <div class="team-contact-info-wrapper">
                            <div class="team-contact-info-card">
                                <div class="team-contact-info-media">
                                    <?php
                                        echo aiero_team_member_media_output(false, true);
                                        if( !empty(aiero_get_post_option('team_member_tag')) ) {
                                            echo '<span class="team-item-tag">';
                                                echo esc_html(aiero_get_post_option('team_member_tag'));
                                            echo '</span>';
                                        }
                                    ?>
                                </div>
                                <?php
                                    if ( !empty(aiero_get_post_option('team_member_contact_info_title')) || !empty(aiero_get_post_option('team_member_contact_info_item')) || !empty(aiero_get_post_option('team_member_email')) || !empty(aiero_get_post_option('team_member_socials')) ) {
                                        echo '<div class="team-contact-info">';
                                            if ( !empty(aiero_get_post_option('team_member_socials')) ) {
                                                $social_items = aiero_get_post_option('team_member_socials');
                                                echo '<ul class="team-socials wrapper-socials">';
                                                foreach ( $social_items as $item ) {
                                                    echo '<li>';
                                                        echo '<a href="' . esc_url($item[1]) . '" target="_blank" class="fab ' . esc_attr($item[0]) . '"></a>';
                                                    echo '</li>';
                                                }
                                                echo '</ul>';
                                            }
                                            if ( !empty(aiero_get_post_option('team_member_contact_info_title')) ) {
                                                echo '<h5>' . esc_html(aiero_get_post_option('team_member_contact_info_title')) . '</h5>';
                                            }
                                            if ( !empty(aiero_get_post_option('team_member_contact_info_item')) ) {
                                                $contact_info_items = aiero_get_post_option('team_member_contact_info_item');
                                                foreach ( $contact_info_items as $item ) {
                                                    echo '<div class="team-contact-info-item">' . esc_html($item) . '</div>';
                                                }
                                            }
                                            if ( !empty(aiero_get_post_option('team_member_email')) ) {
                                                echo '<div class="team-contact-info-item team-contact-info-item-email"><a href="mailto:' . esc_attr(aiero_get_post_option('team_member_email')) . '">' . esc_html(aiero_get_post_option('team_member_email')) . '</a></div>';
                                            }                                                
                                        echo '</div>';
                                    }
                                ?>
                            </div>                            
                            <?php 
                                if ( !empty(aiero_get_post_option('team_member_logo_image')) ) { ?>
                                    <div class="team-info-logo">
                                        <?php
                                            echo aiero_team_member_logo_output();
                                        ?>                                    
                                    </div>
                                <?php }
                            ?>
                        </div>
                        <div class="team-short-info">
                            <div class="team-short-info-text">
                                <?php
                                    if ( !empty(aiero_get_post_option('team_member_position')) ) {
                                        echo '<div class="team-short-info-position">' . esc_html(aiero_get_post_option('team_member_position')) . '</div>';
                                    }
                                    if ( !empty(get_the_title()) ) {
                                        echo '<div class="team-short-info-title">';
                                            echo '<h2 class="team-post-title">' . get_the_title() . '</h2>';
                                        echo '</div>';
                                    }
                                    if ( !empty(aiero_get_post_option('team_member_short_text')) ) {
                                        echo '<div class="team-short-info-description">' . do_shortcode( wpautop( aiero_get_post_option('team_member_short_text') ) ) . '</div>';
                                    }
                                ?>
                            </div>
                            <div class="team-expirience">
                                <?php
                                    if ( !empty(aiero_get_post_option('team_member_experience_title')) ) {
                                        echo '<div class="team-experience-title">';
                                            echo '<h3>' . esc_html(aiero_get_post_option('team_member_experience_title')) . '</h3>';
                                        echo '</div>';
                                    }

                                    if ( !empty(aiero_get_post_option('team_member_education_list')) || !empty(aiero_get_post_option('team_member_experience_list')) ) {
                                        echo '<div class="team-expirience-wrapper">';
                                            if ( !empty(aiero_get_post_option('team_member_education_list')) ) {
                                                $education_items = aiero_get_post_option('team_member_education_list');
                                                echo '<div class="team-expirience-education">';
                                                    echo '<h5>' . esc_html__('Education', 'aiero') . '</h5>';
                                                    echo '<div class="team-experience-list">';
                                                    foreach ( $education_items as $item ) {
                                                        echo '<div class="team-experience-item">';
                                                            echo '<div class="team-experience-item-period">' . esc_html($item[0]) . '</div>';
                                                            echo '<div class="team-experience-item-title">' . esc_html($item[1]) . '</div>';
                                                            echo '<div class="team-experience-item-description">' . esc_html($item[2]) . '</div>';
                                                        echo '</div>';
                                                    }
                                                    echo '</div>';
                                                echo '</div>';
                                            }
                                            if ( !empty(aiero_get_post_option('team_member_experience_list')) ) {
                                                $experience_items = aiero_get_post_option('team_member_experience_list');
                                                echo '<div class="team-expirience-professional">';
                                                    echo '<h5>' . esc_html__('Professional Experience', 'aiero') . '</h5>';
                                                    echo '<div class="team-experience-list">';
                                                    foreach ( $experience_items as $item ) {
                                                        echo '<div class="team-experience-item">';
                                                            echo '<div class="team-experience-item-period">' . esc_html($item[0]) . '</div>';
                                                            echo '<div class="team-experience-item-title">' . esc_html($item[1]) . '</div>';
                                                            echo '<div class="team-experience-item-description">' . esc_html($item[2]) . '</div>';
                                                        echo '</div>';
                                                    }
                                                    echo '</div>';
                                                echo '</div>';
                                            }
                                            if ( !empty(aiero_get_post_option('team_member_responsibilities_title')) || !empty(aiero_get_post_option('team_member_responsibilities_list')) ) {
                                                echo '<div class="team-responsibilities">';
                                                    if ( !empty(aiero_get_post_option('team_member_responsibilities_title')) ) {
                                                        echo '<h6>' . esc_html(aiero_get_post_option('team_member_responsibilities_title')) . '</h6>';
                                                    }
                                                    if ( !empty(aiero_get_post_option('team_member_responsibilities_list')) ) {
                                                        $responsibilities_items = aiero_get_post_option('team_member_responsibilities_list');
                                                        echo '<ul>';
                                                        foreach ( $responsibilities_items as $item ) {
                                                            echo '<li>' . esc_html($item) . '</li>';
                                                        }
                                                        echo '</ul>';
                                                    }
                                                echo '</div>';
                                            }
                                        echo '</div>';
                                    }
                                ?>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>

        <?php
            if ( !empty($content) ) {
                echo '<section>';
                echo '<div class="' . esc_attr($additional_classes) . '">';
                    echo '<div class="content">';
            }
            the_content();
            if ( !empty($content) ) {
                    echo '</div>';
                echo '</section>';
            }
        ?>

    </div>

<?php
get_footer();
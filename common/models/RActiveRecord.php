<?php

namespace common\models;

use common\models\behaviors\SoftDelete;
use Yii;
use yii\behaviors\BlameableBehavior;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\db\Expression;

class RActiveRecord extends ActiveRecord {

    public function init() {
        if ($this->isNewRecord) {
            if ($this->hasAttribute('deleted_at'))
                $this->deleted_at = '0000-00-00 00:00:00';
        }
        return parent::init();
    }

    public function behaviors() {
        return [
                [
                'class' => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['created_at', 'modified_at'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['modified_at'],
                ],
                'value' => new Expression('NOW()')
            ],
                [
                'class' => BlameableBehavior::className(),
                'updatedByAttribute' => 'modified_by',
                'value' => function ($event) {
                    if (isset(Yii::$app->user->identity->user_id))
                        return Yii::$app->user->identity->user_id;
                    else if (isset($this->created_by))
                        return $this->created_by;
                }
            ],
            'softDelete' => [
                'class' => SoftDelete::className(),
                // these are the default values, which you can omit
                'attribute' => 'deleted_at',
                'updatedByAttribute' => 'modified_by',
                'value' => null, // this is the same format as in TimestampBehavior
                'safeMode' => false, // this processes '$model->delete()' calls as soft-deletes
            ],
        ];
    }

    public function setTenant() {
        if (isset(Yii::$app->user->identity) && Yii::$app->user->identity->user_id > 0) {
            if ($this->hasAttribute('tenant_id')) {
                if (empty($this->tenant_id))
                    $this->tenant_id = Yii::$app->user->identity->logged_tenant_id;
            }

            if ($this->hasAttribute('org_id'))
                $this->org_id = Yii::$app->user->identity->user->org_id;
        }
    }

    public function beforeValidate() {
        if ($this->isNewRecord) {
            $this->setTenant();
        } else {
            if ($this->hasAttribute('tenant_id')) {
                if ($this->hasAttribute('current_tenant_id')) {
                    if ($this->current_tenant_id != Yii::$app->user->identity->logged_tenant_id) {
                        $this->addError('tenant_id', 'Branch Mismatch');
                        return FALSE;
                    }
                } else {
                    $model_array = ["PatPatient", "CoUser", "CoPatientCategory"];
                    if (!in_array(\yii\helpers\StringHelper::basename(get_class($this)), $model_array)) {
                        if ($this->tenant_id != Yii::$app->user->identity->logged_tenant_id) {
                            $this->addError('tenant_id', 'Branch Mismatch');
                            return FALSE;
                        }
                    }
                }
            }
        }
        return parent::beforeValidate();
    }

    public function beforeSave($insert) {
        if ($insert) {
            $this->setTenant();
        }
        return parent::beforeSave($insert);
    }

    public function getCreatedUser() {
        return (isset($this->created_by)) ? $this->hasOne(CoUser::className(), ['user_id' => 'created_by']) : '-';
    }

    public function getModifiedUser() {
        return (isset($this->modified_by)) ? $this->hasOne(CoUser::className(), ['user_id' => 'modified_by']) : '-';
    }

    public static function timeAgo($time_ago, $cur_time = NULL) {
        if (is_null($cur_time))
            $cur_time = time();

        $time_elapsed = $cur_time - $time_ago;
        $seconds = $time_elapsed;
        $minutes = round($time_elapsed / 60);
        $hours = round($time_elapsed / 3600);
        $days = round($time_elapsed / 86400);
        $weeks = round($time_elapsed / 604800);
        $months = round($time_elapsed / 2600640);
        $years = round($time_elapsed / 31207680);

        $result = '';
        // Seconds
        if ($seconds <= 60) {
            $result = "$seconds seconds ago";
        }
        //Minutes
        else if ($minutes <= 60) {
            if ($minutes == 1) {
                $result = "one minute ago";
            } else {
                $result = "$minutes minutes ago";
            }
        }
        //Hours
        else if ($hours <= 24) {
            if ($hours == 1) {
                $result = "an hour ago";
            } else {
                $result = "$hours hours ago";
            }
        }
        //Days
        else if ($days <= 7) {
            if ($days == 1) {
                $result = "yesterday";
            } else {
                $result = "$days days ago";
            }
        }
        //Weeks
        else if ($weeks <= 4.3) {
            if ($weeks == 1) {
                $result = "a week ago";
            } else {
                $result = "$weeks weeks ago";
            }
        }
        //Months
        else if ($months <= 12) {
            if ($months == 1) {
                $result = "a month ago";
            } else {
                $result = "$months months ago";
            }
        }
        //Years
        else {
            if ($years == 1) {
                $result = "one year ago";
            } else {
                $result = "$years years ago";
            }
        }

        return $result;
    }

    public static function getDb() {
        return Yii::$app->client;
    }

    public function afterSave($insert, $changedAttributes) {
        if (isset($_SERVER['HTTP_CONFIG_ROUTE']) && isset($_SERVER['HTTP_REQUEST_TIME'])) {
            if (isset(Yii::$app->session['current_time']) && Yii::$app->session['current_time'] == strtotime($_SERVER['HTTP_REQUEST_TIME'])) {
                //
            } else {
                Yii::$app->session['current_time'] = strtotime($_SERVER['HTTP_REQUEST_TIME']);
                $my_events = $this->getEventFromRoute($_SERVER['HTTP_CONFIG_ROUTE']);
                if ($my_events) {
                    foreach ($my_events as $my_event) {
                        $auto_refresh = new CoLog;
                        $auto_refresh->event_occured = $_SERVER['HTTP_CONFIG_ROUTE'];
                        $auto_refresh->event_trigger = $my_event;
                        $auto_refresh->save(false);
                    }
                }
            }
        }

        return parent::afterSave($insert, $changedAttributes);
    }

    private function getEventFromRoute($config_route) {
        $roles_events = ['configuration.role_create', 'configuration.role_update', 'configuration.roles'];
        $op_events = ['patient.encounter', 'patient.appointment', 'patient.changeStatus', 'patient.outPatients'];
        if (in_array($config_route, $roles_events)) {
            return ['configuration.roles'];
        } elseif (in_array($config_route, $op_events)) {
            return ['patient.outPatients'];
        }
        return false;
    }

}

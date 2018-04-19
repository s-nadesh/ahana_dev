<?php

namespace common\models;

use common\models\query\AppConfigurationQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "app_configuration".
 *
 * @property integer $config_id
 * @property integer $tenant_id
 * @property string $key
 * @property string $value
 * @property string $notes
 *
 * @property CoTenant $tenant
 */
class AppConfiguration extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'app_configuration';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['value'], 'required'],
                [['tenant_id'], 'integer'],
                [['key', 'value', 'notes', 'group'], 'string']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'config_id' => 'Config ID',
            'tenant_id' => 'Tenant ID',
            'key' => 'Key',
            'value' => 'Value',
            'group' => 'Group'
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    //Basic configuration for the branches
    public static function getConfigurations() {
        return array(
//            'ROOM_CHARGE_CONFIG' => '12',
            'ELAPSED_TIME' => [
                'code' => 'ET',
                'value' => '3600',
                'notes' => 'seconds',
            ],
            'SHARE_ENCOUNTER' => [
                'code' => 'ENCOUNTER',
                'value' => '1',
                'notes' => 'Share Encounter',
            ],
            'SHARE_NOTES' => [
                'code' => 'NOTES',
                'value' => '1',
                'notes' => 'Share Notes',
            ],
            'SHARE_CONSULTANT' => [
                'code' => 'CONSULTANT',
                'value' => '1',
                'notes' => 'Share Consultant',
            ],
            'SHARE_ALERT' => [
                'code' => 'ALERT',
                'value' => '1',
                'notes' => 'Share Alert',
            ],
            'SHARE_VITALS' => [
                'code' => 'VITALS',
                'value' => '1',
                'notes' => 'Share Vitals',
            ],
            'SHARE_PRESCRIPTION' => [
                'code' => 'PRESCRIPTION',
                'value' => '1',
                'notes' => 'Share Prescription',
            ],
            'SHARE_BILLING' => [
                'code' => 'BILLING',
                'value' => '0',
                'notes' => 'Share Billing',
            ],
            'SHARE_PROCEDURE' => [
                'code' => 'PROCEDURE',
                'value' => '1',
                'notes' => 'Share Procedure',
            ],
            'SHARE_BASIC_DATA' => [
                'code' => 'BASIC',
                'value' => '1',
                'notes' => 'Share Basic Data',
            ],
            'CHECK_STK_PRESC' => [
                'code' => 'CSP',
                'value' => '1',
                'notes' => 'Prescribe medicine in Prescription screen, Provision to check stock or not',
            ],
            'ALLERGIES' => [
                'code' => 'SA',
                'group' => 'prescription_print',
                'value' => '1',
                'notes' => 'Show Allergies',
            ],
            'DIAGNOSIS' => [
                'code' => 'SD',
                'group' => 'prescription_print',
                'value' => '1',
                'notes' => 'Show Diagnosis',
            ],
            'IP_V_BP' => [
                'code' => 'BP',
                'value' => '1',
                'notes' => 'Show Bp field in vital form',
            ],
            'IP_V_P' => [
                'code' => 'Pulse',
                'value' => '1',
                'notes' => 'Show Pulse field in vital form',
            ],
            'IP_V_T' => [
                'code' => 'Temperature',
                'value' => '1',
                'notes' => 'Show Temperature field in vital form',
            ],
            'IP_V_H' => [
                'code' => 'Height',
                'value' => '1',
                'notes' => 'Show Height field in vital form',
            ],
            'IP_V_W' => [
                'code' => 'Weight',
                'value' => '1',
                'notes' => 'Show Weight field in vital form',
            ],
            'IP_V_S' => [
                'code' => 'SP02',
                'value' => '1',
                'notes' => 'Show Sp02 field in vital form',
            ],
            'IP_V_PS' => [
                'code' => 'Pain Score',
                'value' => '1',
                'notes' => 'Show Pain Score field in vital form',
            ],
            'OP_V_BP' => [
                'code' => 'BP',
                'value' => '1',
                'notes' => 'Show Bp field in vital form',
            ],
            'OP_V_P' => [
                'code' => 'Pulse',
                'value' => '1',
                'notes' => 'Show Pulse field in vital form',
            ],
            'OP_V_T' => [
                'code' => 'Temperature',
                'value' => '1',
                'notes' => 'Show Temperature field in vital form',
            ],
            'OP_V_H' => [
                'code' => 'Height',
                'value' => '1',
                'notes' => 'Show Height field in vital form',
            ],
            'OP_V_W' => [
                'code' => 'Weight',
                'value' => '1',
                'notes' => 'Show Weight field in vital form',
            ],
            'OP_V_S' => [
                'code' => 'SP02',
                'value' => '1',
                'notes' => 'Show Sp02 field in vital form',
            ],
            'OP_V_PS' => [
                'code' => 'Pain Score',
                'value' => '1',
                'notes' => 'Show Pain Score field in vital form',
            ],
            'Prescription ID' => [
                'group' => 'prescription_print',
                'code' => 'PID',
                'value' => '1',
                'notes' => 'Show prescription id',
            ],
            'Issued By' => [
                'group' => 'prescription_print',
                'code' => 'PIB',
                'value' => '1',
                'notes' => 'Show issued by',
            ],
            'Issued At' => [
                'group' => 'prescription_print',
                'code' => 'PIA',
                'value' => '1',
                'notes' => 'Show issued at',
            ],
            'Prescription' => [
                'group' => 'prescription_tab',
                'code' => 'PTP',
                'value' => '1',
                'notes' => 'Show prescription tab',
            ],
            'Medical history' => [
                'group' => 'prescription_tab',
                'code' => 'PTM',
                'value' => '1',
                'notes' => 'Show medical history tab',
            ],
            'Vitals' => [
                'group' => 'prescription_tab',
                'code' => 'PTV',
                'value' => '1',
                'notes' => 'Show vitals tab',
            ],
            'Results' => [
                'group' => 'prescription_tab',
                'code' => 'PTR',
                'value' => '1',
                'notes' => 'Show result tab',
            ],
            'Notes' => [
                'group' => 'prescription_tab',
                'code' => 'PTN',
                'value' => '1',
                'notes' => 'Show notes tab',
            ],
            'IP_V_BMI' => [
                'code' => 'BMI',
                'value' => '1',
                'notes' => 'Show BMI field in vital form',
            ],
            'OP_V_BMI' => [
                'code' => 'BMI',
                'value' => '1',
                'notes' => 'Show BMI field in vital form',
            ],
            'Page Size' => [
                'group' => 'op_bill_print',
                'code' => 'PS',
                'value' => 'A5',
                'notes' => 'Change OP bill page size',
            ],
            'Page Layout' => [
                'group' => 'op_bill_print',
                'code' => 'PL',
                'value' => 'A5',
                'notes' => 'Change OP bill page layout',
            ],
            'Prescription top margin' => [
                'group' => 'prescription_print',
                'code' => 'PMT',
                'value' => '46',
                'notes' => 'MM',
            ]
        );
    }

    public static function find() {
        return new AppConfigurationQuery(get_called_class());
    }

    public function fields() {
        $extend = [];

        $parent_fields = parent::fields();
        $addt_keys = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'pres_configuration':
                    $parent_fields = [
                        'group' => 'group',
                        'code' => 'code',
                        'key' => 'key',
                        'value' => 'value',
                        'notes' => 'notes'
                    ];
                    break;
            endswitch;
        }

        $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public static function getConfigurationByKey($key) {
        $result = self::find()->tenant()->active()->andWhere(['key' => $key])->one();
        return $result;
    }

    public static function getConfigurationByCode($code) {
        $result = self::find()->tenant()->active()->andWhere(['code' => $code])->one();
        return $result;
    }

    public static function getConfigurationByGroup($group) {
        $result = self::find()->tenant()->active()->andWhere(['group' => $group])->all();
        return $result;
    }

}
